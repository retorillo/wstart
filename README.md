# wstart

[![NPM](https://img.shields.io/npm/v/wstart.svg)](https://www.npmjs.com/package/wstart)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

`wstart` is Node.js package that allow you to run Windows command from Bash
on Ubuntu on Windows.

`wstart` is constituted with `server` and `client`. On Windows it runs as
`server`, on Bash it runs as `client`.

Can open Windows applications in new window from Bash, or run Windows commands
inside Bash.

## Requirements

- Windows 10
- Bash on Ubuntu on Windows
- Node.js (>=4.0.0)

In this document, "Bash" referes "Bash on Ubuntu on Windows"

## Installation

Node.js must be insalled both on Windows and Bash.

on Bash:

Specify your Windows username at `<WINUSERNAME>`.

```bash
sudo apt-get update
sudo apt-get install openssl -y
npm install -g wstart
wstart-init <WINUSERNAME>
```

on Windows:

```bash
npm install -g wstart
```

## Running wstart command

`wstart` must be running on Windows in order to use `wstart` command on Bash.

On Bash, `wstart` can be used in the following two ways:

### In New Window

`wstart cmd` can run `cmd.exe` in new window. 

Because it internally calls `start` command, you can type `wstart .` to run
`cmd.exe`, or type `wstart /mnt/c` and `wstart ~/` to open C drive and lxss home
directory in Windows Explorer.

- Linux style path will be automatically converted to Windows path. To learn more,
see [Path conversion](#path-conversion).
- To learn Windows `start` command, run `start /?` on cmd.exe.

### Inside Bash

By using exclamation mark (`!`) like `wstart ! cmd`, can run commands inside Bash.

- In Vim, note that `!` must be escaped like `:!wstart \! cmd`.

## Path conversion

This package has path conversion between Windows and Ubuntu.

For example, `wstart echo ~/` will says `C:\Users\YourName`,
 `wstart echo /mnt/c/Windows` will says `C:\Windows`, and so forth.

This is convenient, but might be unexpected in some case.

To surpress this, use atmark(`@`) as prefix for each parameters.
(eg. `wstart echo @/mnt/c` says `/mnt/c`)

If want to pass parameter that start with atmark, must enter atmark twice.
(eg. `wstart echo @@/mnt/c` says `@/mnt/c`)

## Security

`server` and `client` will communicate under local only TLS connection with
key-based authorization. 

Generally it is safe, but might become a unexpected backdoor.

I recommend to close `server` if not required.

## Changing Port

Port 62000 is used by default, you can change it via the following configuration file.

- `~/.wstart/wstart.json` (Bash)
- `%USERPROFILE%/.wstart/wstart.json` (Windows)

## Uninstallation

Run `npm uninstall -g wstart` on both environments.

## License

Distributed under the MIT license.

Copyright (C) 2016 Retorillo
