# Nextcloud Translate CLI

Translate Nextcloud project in a single file.

<br/>

## Requirements
 - Nodejs
 - PHP
 - gettext

*For more information click [**here**.](https://docs.nextcloud.com/server/stable/developer_manual/basics/front-end/l10n.html?highlight=translate#manual-translation)*

<br/>

## Installation
```sh-session
$ npm i -g nextcloud-translate-cli
```

<br/>

## Usage
```sh-session
$ nct [options]
```
or
```sh-session
$ nc-translate [options]
```

<br/>

## Options
```
Options:
  -v, --version              Output the version number
  -i, --init                 Read all .pot files from project and save all strings in the translate.pot file
  -f, --fill-translate-file  Read all translated strings and fill the translate.pot file
  -t, --translate            Translate project with translate.pot file
  -l, --lang <lang>          Translation language (default: "fa")
  -h, --help                 Display help for command
```

<br/>

# License
[MIT License](./LICENSE)
