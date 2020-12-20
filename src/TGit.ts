'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class TGit {

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
        this.run("resolve", true);
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

    public static blame(){
        let line = 1;
        if (vscode.window.activeTextEditor){
            line = vscode.window.activeTextEditor.selection.active.line + 1;
        }
        this.run("blame", true, true, `/line:${line}`);
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
        this.run("reflog", false, false, '/ref:"refs/stash"');
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

    private static run(command: string, withFilePath: boolean = false, filePathRequired: boolean = false, additionalParams: string = null){
        const path = this.getWorkingPath(withFilePath, filePathRequired);
        if (!path || path == "."){
            vscode.window.showErrorMessage(`The '${command}' command requires an existing file ${filePathRequired ? "" : "or folder"} to be open.`);
            return;
        }

        const launcherPath = vscode.workspace.getConfiguration("tgit").get("launcherPath");
        let cmd = `"${launcherPath}" /command:${command} /path:"${path}"`;
        if (additionalParams){
            cmd += " " + additionalParams;
        }
        require("child_process").exec(cmd);
    }

    private static getWorkingPath(preferFilePath: boolean, filePathRequired: boolean): string {
        let path = (preferFilePath ? this.getWorkingFile() : null);
        if (filePathRequired) {
            return path;
        }

        return path
            || this.getRootGitFolder(this.getWorkingFolder())
            || this.getRootGitFolder(this.getWorkingFileFolder())
    }

    private static getRootGitFolder(currentFolder: string) : string {
        if (!currentFolder){
            return null;
        }
        while (!fs.existsSync(currentFolder + path.sep + ".git")) {
            let parentDir = path.dirname(currentFolder);
            if (currentFolder == parentDir){
                currentFolder = null;
                break;
            }
            else {
                currentFolder = parentDir;
            }
        }
        return currentFolder;
    }

    private static getWorkingFolder() : string { 
        const workspaceFolders = vscode.workspace.workspaceFolders;
        return (workspaceFolders && workspaceFolders.length) ? workspaceFolders[0].uri.fsPath : null;
    }

    private static getWorkingFileFolder() : string {
        const currentFile = this.getWorkingFile();
        return currentFile ? path.dirname(currentFile) : null;
    }

    private static getWorkingFile() : string {
        return vscode.window.activeTextEditor?.document.fileName;
    }
}