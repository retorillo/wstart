# wstart

[![NPM](https://img.shields.io/npm/v/wstart.svg)](https://www.npmjs.com/package/wstart)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

`wstart`はBash on Ubuntu on WindowsからWindowsのコマンドを呼び出すことができるNode.jsパッケージです。

`wstart`はサーバーとクライアントで構成され、Windows上ではサーバー、Bash上ではクライアントとして起動します。

BashからWindowsアプリケーションを新しいウィンドウで開いたり、Bash内でWindows上のコマンドを実行することが可能です。

## 要件

- Windows 10
- Bash on Ubuntu on Windows
- Node.js (>=4.0.0)

※ このドキュメント上での`Bash`は`Bash on Ubuntu on Windows`のことを示します。

## インストール

BashとWindowsどちらの環境にもNode.jsをインストールしてください。

Bash上で次のコマンドを実行してください。
`<WINUSERNAME>`の箇所にはWindowsユーザー名を指定してください。

```bash
sudo apt-get update
sudo apt-get install openssl -y
npm install -g wstart
wstart-init <WINUSERNAME>
```

Windows上で次のコマンドを実行してください

```bash
npm install -g wstart
```

## wstartの実行

Bash上で`wstart`を実行するためには、Windows上で`wstart`を実行しサーバーを起動状態にしておく必要があります。

Bash上で`wstart`を使用する場合は以下の2通りの方法があります。

### 新しいウィンドウとして開く

`wstart cmd`と実行すると、`cmd`を新しいウィンドウとして開き実行します。これは内部的に`start`コマンドを呼び出して実現しているため、`wstart .`とするだけでも構いませんし、`wstart /mnt/c/`や`wstart ~/`としてCドライブやlxss上のホームディレクトリをエクスプローラで開くことも可能です。

- Linux形式のパスは自動的にWindows上のパスに変換されます。詳しくは[自動パス変換](#自動パス変換)をご確認ください。
- `start`コマンドについて詳しくは`cmd`内で`start /?`をご参照ください。

### Bash内で実行する

`wstart ! cmd`のように感嘆符 `!` を使用することで、Bash内でコマンドを実行することができます。

- Vim上で実行する場合は `:!wstart \! cmd`として、感嘆符をエスケープする必要がある点にご注意ください。

## 自動パス変換

`wstart`はBashのパスをWindows上のパスに自動変換する仕組みが備わっており、例えば、`wstart echo ~/`や`wstart echo /mnt/c`などはそれぞれ存在するWindows上のパスを表示するはずです。

この仕組みは通常便利ですが、意図的にLinux形式のパスのままパラメーターを渡したい場合にはトラブルとなる場合もあります。

この自動変換を防ぎたい場合は各パラメーターの先頭にアットマーク(`@`)をつけてください。

たとえば、`wstart echo @~/`は`~/`と表示されるはずです。

なお先頭が`@`から始まるパラメーターを受け渡したい場合は、`@@`としてください。

たとえば、`wstart echo @@atmark`は`@atmark`と表示されるはずです。

## セキュリティ

サーバーとクライアントの通信はローカルホスト内だけで完結し、鍵認証および暗号化(TLS)で保護されています。

一般的には安全な仕組みだと思われますが、攻撃により意図しないバックドアになる可能性はあります。サービスなどとして常時サーバーを起動し続けることは推奨しません。

## ポートの変更

デフォルトで62000番ポートを使用しますが、他のアプリケーションと競合する場合、以下のファイルにて変更することができます。

- `~/.wstart/wstart.json` (Bash)
- `%USERPROFILE%/.wstart/wstart.json` (Windows)

## アンインストール

`npm uninstall -g wstart` を両方の環境で実行してください。

## 著作権・ライセンス

MITライセンスとして配布します。

Copyright (C) 2016 Retorillo
