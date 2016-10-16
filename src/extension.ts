'use strict';

import * as vscode from 'vscode';
import { TGit } from './TGit';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("tgit.fetch", () => TGit.fetch()));
    context.subscriptions.push(vscode.commands.registerCommand("tgit.showLog", () => TGit.showLog()));
    context.subscriptions.push(vscode.commands.registerCommand("tgit.showFileLog", () => TGit.showFileLog()));
    context.subscriptions.push(vscode.commands.registerCommand("tgit.commit", () => TGit.commit()));
    context.subscriptions.push(vscode.commands.registerCommand("tgit.revert", () => TGit.revert()));
    context.subscriptions.push(vscode.commands.registerCommand("tgit.switch", () => TGit.switch()));
    context.subscriptions.push(vscode.commands.registerCommand("tgit.merge", () => TGit.merge()));
    context.subscriptions.push(vscode.commands.registerCommand("tgit.diff", () => TGit.diff()));
    context.subscriptions.push(vscode.commands.registerCommand("tgit.blame", () => TGit.blame()));
    context.subscriptions.push(vscode.commands.registerCommand("tgit.pull", () => TGit.pull()));
    context.subscriptions.push(vscode.commands.registerCommand("tgit.push", () => TGit.push()));
    context.subscriptions.push(vscode.commands.registerCommand("tgit.rebase", () => TGit.rebase()));
    context.subscriptions.push(vscode.commands.registerCommand("tgit.stashSave", () => TGit.stashSave()));
    context.subscriptions.push(vscode.commands.registerCommand("tgit.stashPop", () => TGit.stashPop()));
    context.subscriptions.push(vscode.commands.registerCommand("tgit.stashList", () => TGit.stashList()));
    context.subscriptions.push(vscode.commands.registerCommand("tgit.sync", () => TGit.sync()));
}

export function deactivate() {
}