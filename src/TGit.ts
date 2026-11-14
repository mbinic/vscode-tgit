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
        // (windows delimiters on linux path)
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
        let pathsTried = "";
        for (const pathToTry of pathsToTry) {
            // if a specific file is not required, we must return git root
            // eg. for "Diff" we need to return the git root not the 
            // current file, as that will display the "File-Diff"
            const tgitFriendlyPath = this.getTortoiseGitFriendlyPath(pathToTry, !filePathRequired);
            if (tgitFriendlyPath) return tgitFriendlyPath;
            pathsTried += pathToTry + "\n";
        }

        const msg = `No valid TortoiseGit file path found.\n
        Are you triggering while focus is not a file from a git project?\n
        Is the file within a git project (a parent dir has a .git folder)?\n
        You may need to configure setting: "tgit.pathOverrides"\n
        File paths tried:\n${pathsToTry.join("\n")}`
        this.log.error(msg);
        throw new Error(msg);
    }

    /**
     * To be a TortoiseGit friendly path it must be a path that TortoiseGit can
     * actually find, and it must be or have a parent directory that has a .git
     * folder.
     * For the first condition, there are many cases to cover:
     * 1) Windows PC, nothing remote
     *      fs get git root
     * 2) Windows PC, linux devcontainer (code located on windows filesystem)
     *      apply path overrides -> fs get git root
     * 3) Windows PC, linux devcontainer (code located on wsl filesystem)
     *      untested, assume same as above
     * 4) Linux PC, running TortoiseGit in wine (code on linux filesystem)
     *      fs get git root -> apply path overrides
     * 5) Linux PC, running TortoiseGit in wine (code on wine windows filesystem)
     *      untested, assume same as above
     * 5) Linux PC, running TortoiseGit in wine, linux devcontainer (code on linux filesystem)
     *      apply overrides (translate to PC path) -> fs get git root -> apply overrides (translate to wine windows path)
     * @param pathOriginal 
     * @param getGitRoot - should return the nearest parent folder that has a 
     * .git folder
     * @returns "" if the path is unusable by tgit, else the converted path
     */
    private static getTortoiseGitFriendlyPath(pathOriginal: string, getGitRoot: boolean): string {
        
        let lastPath;
        let currentPath = pathOriginal;
        let isValid = false;
        // repeatedly look for git root (if requested), and apply overrides, 
        // until no changes to cover all cases
        while (lastPath != currentPath) {
            lastPath = currentPath;
            // try to get git root first
            if (getGitRoot) {
                let gitRoot = this.getRootGitFolder(currentPath);
                if (gitRoot) currentPath = gitRoot;
            }
            // at some point of all the conversions the file path must exist to be valid
            if (fs.existsSync(currentPath)) isValid = true;
            // apply any overrides
            let overridenPath = this.applyPathOverrides(currentPath);
            if (overridenPath) currentPath = overridenPath;
        }
        return isValid ? currentPath : "";
    }

    /**
     * Note: fs and path runs against the local machine's filesystem (for 
     * remote/devcontainer users), so currentPath must be know to the local
     * machine's file system for this to work.
     * @param currentPath in local machine's os's format
     * @returns 
     */
    private static getRootGitFolder(currentPath: string) : string {
        if (!currentPath || !fs.existsSync(currentPath)) return "";
        const originalPath = currentPath;

        let lastPath;
        while (currentPath != lastPath) {
            if (fs.existsSync(currentPath + path.sep + ".git")) return currentPath;
            // else, go up one level
            currentPath = path.dirname(currentPath);
        }
        // we reached the file system root and no .git was found
        this.log.info(`Could not find matching tgit.pathOverrides for "${originalPath}"`)
        return "";
    }

    /**
     * Attempts to convert a (suspected) remote path to a local path.
     * 
     * Utilizes settings in tgit.pathOverrides.
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
    private static applyPathOverrides(remoteFilePath: string): string {
        // get tgit.pathOverrides settings.json
        const pathOverrides = vscode.workspace.getConfiguration('tgit').get<{ fromRoot : string, toRoot : string }[]>('pathOverrides', []);
        
        // If we're in a remote env (devcontainer), but don't have the override setting, warn user
        if (vscode.env.remoteName && !pathOverrides.length) {
            vscode.window.showErrorMessage("You appear to be in a remote env (eg. devcontainer), but haven't set tgit.pathOverrides, tgit-cmds will likely not work.");
        }
        
        // Find the matching override
        let override;
        for (const pathOverride of pathOverrides) {
            const isChildPath = this.isChildPath(pathOverride.fromRoot, remoteFilePath);
            if (isChildPath) override = pathOverride;
        }
        
        // if no match, just leave the path alone
        if (!override) {
            if (vscode.env.remoteName) {
                this.log.info(`Could not find matching tgit.pathOverrides for "${remoteFilePath}"`)
            }
            return remoteFilePath;
        }

        // Else, need to replace the remote folder with the local one

        // Is path windows (so we know what separator to use)
        const fromRootOS = this.getOSPathModuleForFilePath(override.fromRoot);
        const toRootOS = this.getOSPathModuleForFilePath(override.toRoot);
        
        // remove the matched fromRoot
        const relative = fromRootOS.relative(override.fromRoot, remoteFilePath);
        // segment the relative path to make it OS-agnostic
        const segments = relative.split(fromRootOS.sep);

        // append the segments to the local folder override
        return toRootOS.join(override.toRoot, ...segments);
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