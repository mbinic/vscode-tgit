'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';

export class TGit {
    static log: vscode.LogOutputChannel;

    public static setLogger(logger: vscode.LogOutputChannel) {
        this.log = logger;
    }

    public static fetch(){
        this.run("fetch");
    }

    public static showLog(){
        this.run("log");
    }

    public static showFileLog(){
        this.run("log", true);
    }

    public static commit(){
        this.run("commit");
    }

    public static revert(){
        this.run("revert");
    }

    public static cleanup(){
        this.run("cleanup");
    }

    public static resolve(){
        this.run("resolve");
    }

    public static switch(){
        this.run("switch");
    }

    public static merge(){
        this.run("merge");
    }

    public static diff(){
        this.run("diff", true);
    }

    public static diffRepo() {
        this.run("diff");
    }

    public static revisionGraph() {
        this.run("revisiongraph");
    }

    public static settingsWindow() {
        this.run("settings");
    }

    public static blame(){
        let line = 1;
        if (vscode.window.activeTextEditor){
            line = vscode.window.activeTextEditor.selection.active.line + 1;
        }
        this.run("blame", true, `/line:${line}`);
    }

    public static pull(){
        this.run("pull");
    }

    public static push(){
        this.run("push");
    }

    public static rebase(){
        this.run("rebase");
    }

    public static stashSave(){
        this.run("stashsave");
    }

    public static stashPop(){
        this.run("stashpop");
    }

    public static stashList(){
        this.run("reflog", false, '/ref:"refs/stash"');
    }

    public static sync(){
        this.run("sync");
    }

    public static bisectStart(){
        this.run("bisect /start");
    }

    public static bisectGood(){
        this.run("bisect /good");
    }

    public static bisectBad(){
        this.run("bisect /bad");
    }

    public static bisectSkip(){
        this.run("bisect /skip");
    }

    public static bisectReset(){
        this.run("bisect /reset");
    }

    private static run(command: string, filePathRequired: boolean = false, additionalParams: string = ""){
        const path = this.getCommandPath(filePathRequired);
        const launcherPath = vscode.workspace.getConfiguration("tgit").get("launcherPath");
        let cmd = `"${launcherPath}" /command:${command} /path:"${path}"`;
        if (additionalParams){
            cmd += " " + additionalParams;
        }
        this.log.info(`${cmd}`);
        child_process.exec(cmd);
    }

    private static getCommandPath(filePathRequired: boolean): string {
        const pathsToTry = [];

        // Always include the current text file in pathsToTry even if
        // filePathRequired==false as this will allow the user to see tgit
        // windows for the current file's project (in a multi-git/multi-folder
        // workspace)

        // Current file path (works for local project)
        // devcontainer will get a mixed-os path, eg. "\\workspaces\\<project>""
        pathsToTry.push(vscode.window.activeTextEditor?.document.uri.fsPath || "");
        // Current file path (works better for remote/devcontainer/wsl) 
        // devcontainer will get the remote path without OS-mixing, eg. /workspace/<project>
        pathsToTry.push(vscode.window.activeTextEditor?.document.uri.path || "");

        // If a specific file is not required
        if (!filePathRequired) {
            // add all workspace folder paths
            const workspaceFolders = vscode.workspace.workspaceFolders || [];
            for (const workspaceFolder of workspaceFolders) {
                pathsToTry.push(workspaceFolder.uri.fsPath);
                pathsToTry.push(workspaceFolder.uri.path);
            }
        }

        // find the first valid path
        for (const pathToTry of pathsToTry) {
            const tgitFriendlyPath = this.getTortoiseGitFriendlyPath(pathToTry);
            if (tgitFriendlyPath) {
                if (!filePathRequired) {
                    // if a specific file is not required, we must return git root
                    // eg. for "Diff" we need to return the git root not the 
                    // current file, as that will display the "File-Diff"
                    return this.getRootGitFolder(tgitFriendlyPath);
                }
                return tgitFriendlyPath;
            }
        }
                
        const msg = `Couldn't get valid path for TortoiseGit.  May need to bo focused on file from a git project in text editor panel.  Tried\n: ${JSON.stringify(pathsToTry)}`;
        this.log.error(msg);
        throw new Error(msg);
    }

    /**
     * To be a TortoiseGit friendly path it must be a path written in the 
     * correct OS's syntax, it must be a path that TortoiseGit can actually 
     * find, and it must be or have a parent directory that has a .git folder.
     * @param pathToConvert 
     * @returns "" if the path is unusable by tgit, else the converted path
     */
    private static getTortoiseGitFriendlyPath(pathToConvert: string): string {
        // if the file path doesn't exist:
        // 1) The user might be on the output panel (in a devcontainer this 
        //   returns a string)
        // 2) The user might be in a remote env (devcontainer). (this returns an
        //   invalid, mixed-os  path like \\workspaces\\<project>)
        if (!fs.existsSync(pathToConvert)) {
            // assume 2) and try using overrides
            pathToConvert = this.applyRemotePathOverrides(pathToConvert);
            // If file path still doesn't exist, it's probably 1), so it's invalid
            if (!fs.existsSync(pathToConvert)) return "";
        }

        // get the file's git folder
        let gitFolder = this.getRootGitFolder(pathToConvert);

        // To be a valid file path it must be inside of a git project
        if (!gitFolder) {
            this.log.warn(`File "${pathToConvert}" is not within a git project.`)
            return "";
        }

        return pathToConvert;
    }

    /**
     * Note: fs and path runs against the local machine's filesystem (for 
     * remote/devcontainer users), so currentPath must be converted before
     * @param currentPath in local machine's os's format
     * @returns 
     */
    private static getRootGitFolder(currentPath: string) : string {
        if (!currentPath || !fs.existsSync(currentPath)) return "";

        while (!fs.existsSync(currentPath + path.sep + ".git")) {
            let parentDir = path.dirname(currentPath);
            if (currentPath == parentDir){
                currentPath = "";
                break;
            }
            else {
                currentPath = parentDir;
            }
        }
        return currentPath;
    }

    /**
     * Attempts to convert a (suspected) remote path to a local path.
     * 
     * Utilizes settings in tgit.remotePathOverrides.
     * 
     * eg. replace /workspace/<project> with C:\Users\<user>\repos\<project>.
     * This is meant for remote/devcontainer/wsl users so that we can return
     * local tortoisgit-friendly paths.
     * 
     * Note for future devs: ENV variables instead of settings.json don't 
     * really work because process.env is the windows/host process. It might be
     * possible to read devcontainer env variables by spinning up a terminal,
     * and echoing/outputting/reading the env variable. But that's ugly and the
     * user would also have to do something like modify devcontainer.json:
     * "remoteEnv": { "OVERRIDE_WORKSPACE_FOLDER": "${localWorkspaceFolder}" }
     * to set the ENV var.
     * 
     * @returns The converted path, or an empty string.  Empty string if it 
     * can't get a positive fs.exists result before or after conversion.
     */
    private static applyRemotePathOverrides(remoteFilePath: string): string {
        // get tgit.remotePathOverrides settings.json
        const remotePathOverrides = vscode.workspace.getConfiguration('tgit').get<[{ remotePath : string, localPath : string }]>('remotePathOverrides') || [];
        
        // If we're in a remote env (devcontainer), but don't have the override setting, warn user
        if (vscode.env.remoteName && !remotePathOverrides.length) {
            vscode.window.showErrorMessage("You appear to be in a remote env (eg. devcontainer), but haven't set tgit.remotePathOverrides, tgit-cmds will likely not work.");
        }
        
        // Find the matching override
        let override;
        for (const remotePathOverride of remotePathOverrides) {
            const isChildPath = this.isChildPath(remotePathOverride.remotePath, remoteFilePath);
            if (isChildPath) override = remotePathOverride;
        }
        
        // if no match, just leave the path alone
        if (!override) {
            if (vscode.env.remoteName) {
                this.log.warn(`Could not find matching tgit.remotePathOverrides for "${remoteFilePath}"`)
            }
            return remoteFilePath;
        }

        // Else, need to replace the remote folder with the local one

        // Is path windows (so we know what separator to use)
        const remotePathOS = this.getOSPathModuleForFilePath(override.remotePath);
        const localPathOS = this.getOSPathModuleForFilePath(override.localPath);
        
        // remove the matched remotePath
        const relative = remotePathOS.relative(override.remotePath, remoteFilePath);
        // segment the relative path to make it OS-agnostic
        const segments = relative.split(remotePathOS.sep);

        // append the segments to the local folder override
        return localPathOS.join(override.localPath, ...segments);
    }

    private static isChildPath(parent : string, child : string): Boolean {
        const pathOS = this.getOSPathModuleForFilePath(parent);
        const relative = pathOS.relative(parent, child);
        if (relative == "") return true; // the parent and the child are the same path
        return relative && !relative.startsWith('..') && !pathOS.isAbsolute(relative);
    }

    private static getOSPathModuleForFilePath(filePath : string) {
        // If filePath contains backslashes or starts with a drive letter C:\
        if (/\\/.test(filePath) || /^[a-zA-Z]:/.test(filePath))
            return path.win32;
        else
            return path.posix;
    }
}