# TortoiseGit commands for Visual Studio Code

## Introduction

Inspired by the [TortoiseGit Toolbar Visual Studio extension](https://github.com/MRCollective/TortoiseGitToolbar), this extension provides commands for launching common TortoiseGit dialogs from within Visual Studio Code.

You can execute these commands either by searching for `TGit` in the Command Palette (`Ctrl+Shift+P`), or via keyboard shortcuts.

## Default shortcuts

Global shortcuts:

* `(G)it (C)ommit` - Ctrl+G, Ctrl+C
* `(G)it (F)etch` - Ctrl+G, Ctrl+F
* `(G)it (L)og` - Ctrl+G, Ctrl+L
* `(G)it (M)erge` - Ctrl+G, Ctrl+M
* `(G)it (P)ull` - Ctrl+G, Ctrl+P
* `(G)it P(u)sh` - Ctrl+G, Ctrl+U
* `(G)it (R)ebase` - Ctrl+G, Ctrl+R
* `(G)it Re(v)ert` - Ctrl+G, Ctrl+V
* `(G)it Stash-L(i)st` - Ctrl+G, Ctrl+I
* `(G)it Stash-P(o)p` - Ctrl+G, Ctrl+O
* `(G)it Stash-S(a)ve` - Ctrl+G, Ctrl+A
* `(G)it (S)witch` - Ctrl+G, Ctrl+S
* `(G)it S(y)nc` - Ctrl+G, Ctrl+Y
* `(G)it Clea(n)up` - Ctrl+G, Ctrl+N
* `(G)it Repository (D)iff` - Ctrl+G, Ctrl+D
* `(G)it R(e)solve Conflicts` - Ctrl+G, Ctrl+E
* `(G)it Revision (G)raph` - Ctrl+G, Ctrl+G
* `(G)it Settings` - Ctrl+G, Ctrl+,

Current file shortcuts:

* `(G)it File (L)og` - Ctrl+Shift+Alt+G, Ctrl+Shift+Alt+L
* `(G)it File (B)lame` - Ctrl+Shift+Alt+G, Ctrl+Shift+Alt+B
* `(G)it File (D)iff` - Ctrl+Shift+Alt+G, Ctrl+Shift+Alt+D

Bisect commands are also available, but with no preset shortcuts.

**To customize shortcuts go to File -> Preferences -> Keyboard Shortcuts.**

### Shortcut conflicts

Since the default shortcuts will make Ctrl+G (Go To Line) inaccessible, you can change them, or just change the one for "Go To Line" to be e.g. Ctrl+G, Ctrl+T:
```javascript
{ "key": "Ctrl+g Ctrl+t", "command": "workbench.action.gotoLine" }
```

## Extension Settings

This extension contributes the `tgit.launcherPath` setting, specifying the full path to `TortoiseGitProc.exe`.
It is set to the default installation path of TortoiseGit, so you might need to adjust it if you installed elsewhere.

`tgit.remotePathOverrides` is intended for devcontainer (and maybe other remote?) users. 
Checks if a file is on a `remotePath` and replaces that portion of the path with the `localPath`.
Supports mutli-folder workspaces.  
```
    "tgit.remotePathOverrides": [
        // devcontainer example
        {
            "remotePath": "/workspaces/<project>",
            "localPath": "C:\\Users\\<user>\\repos\\<project>",
        },
        // multi-folder example that points to a local wsl location
        {
            "remotePath": "/workspaces/<project2>",
            "localPath": "\\\\wsl.localhost\\Ubuntu-26.04\\home\\<user>\\<project2>",
        },
    ]
```

---

## Running the code
* run `npm install` in the checkout directory to install dependencies
* press `F5` to open a new VSCode window with the extension loaded
* run a command from the command palette by pressing `Ctrl+Shift+P` and typing `tgit`
* set breakpoints inside `src/extension.ts` to debug the extension
* find output from the extension in the debug console
* you can relaunch the extension from the debug toolbar after changing code in `src/extension.ts`
* you can also use `Ctrl+R` to reload the VS Code window with the extension to load any changes

---

**Here's to productivity!**