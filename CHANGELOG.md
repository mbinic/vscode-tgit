
## 1.5.2

- Added `TGit: Settings` (ctrl+g, ctrl+,) - opens the tortoise git settings window

## 1.5.1

- tgit.resolve is repo-level only. file-level opens the same dialog, but filtered to only show the current file, and only if it's conflicted.  Repo-level just shows all conflicted files.

## 1.5.0

- Added devcontainer support via `settings.json` `tgit.remotePathOverrides`
  - may also work for supporting other remote environments
- Support multi-folder workspaces
  - If a command is issued on a file in project-folder B, then it should open the TortoiseGit UI for project B, not project A
- Added Git Revision Graph (ctrl+g, ctrl+g)
- Added Output panel info/warnings/errors to help the user
- Strictly differentiate "Diff" vs "File Diff"
  - "File Diff" should try to open a file diff, if there is no valid file it should fail, not open the unexpected project diff.

## 1.4.2

- Extension will only run locally, i.e. not attempt to run on remote hosts

## 1.4.1

- Using current file path to look for .git folder when the workspace folder is not a git repo (#2)
- Fixed a deprecation warning

## 1.4.0

- Moved away from Yarn
- Updated dependencies and VS Code target version

## 1.3.1

- Fixed working with folders on network shares (#2) and WSL file systems (#13)

## 1.3.0

- Added repository diff command (#10)
- Fixed resolve command (#11)
- File log and resolve now fall back to directory when no file is open (#11)
- File diff falls back to repository diff when no file is open

## 1.2.2

- Updated dependencies

## 1.2.1

- Fixed cleanup command (#3)
- Updated dependencies

## 1.2.0

- Added bisect command family

## 1.1.1

- Launch commands from git root folder (containing .git subfolder)

## 1.0.0

- Initial release
