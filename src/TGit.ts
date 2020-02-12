'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class TGit {

    public static fetch(){
        this.run("fetch", false);
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
        this.run("diff", true, true);
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

    public static diffRepo() {
        this.run("diff");
    }

    private static run(command: string, withFilePath: boolean = false, filePathRequired: boolean = false, additionalParams: string = null){
        let workingDir = this.getRootGitFolder();
        let targetPath = withFilePath ? this.getWorkingFile() : workingDir;
        if (!workingDir || workingDir == "." || (filePathRequired && (!targetPath || targetPath == "."))){
            vscode.window.showErrorMessage(`This command requires an existing file ${filePathRequired ? "" : "or folder"} to be opened.`);
            return;
        }

        let launcherPath = vscode.workspace.getConfiguration("tgit").get("launcherPath");
        let cmd = `"${launcherPath}" /command:${command}`;
        if (withFilePath && targetPath){
            cmd += ` /path:"${targetPath}"`;
        }
        if (additionalParams){
            cmd += " " + additionalParams;
        }
        require("child_process").exec(cmd, { cwd: workingDir });
    }

    private static getRootGitFolder(){
        let workingDir = this.getWorkingDirectory();
        if (!workingDir){
            return null;
        }

        let rootDir = workingDir;
        while (!fs.existsSync(rootDir + path.sep + ".git")){
            let parentDir = path.dirname(rootDir);
            if (rootDir == parentDir){
                rootDir = null;
                break;
            }
            else {
                rootDir = parentDir;
            }
        }
        return rootDir || workingDir;
    }

    private static getWorkingDirectory(){
        if (vscode.workspace.rootPath){
            return vscode.workspace.rootPath;
        }
        let currentFile = this.getWorkingFile();
        if (currentFile){
            return path.dirname(currentFile);
        }
        return null;
    }

    private static getWorkingFile(){
        if (vscode.window.activeTextEditor){
            return vscode.window.activeTextEditor.document.fileName;
        }
        return null;
    }
}