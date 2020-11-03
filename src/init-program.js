import { Command } from 'commander';

import packageJson from '../package.json';

export default function (args) {
  const program = new Command();

  program
    .helpOption('-h, --help', 'Display help for command')
    .version(packageJson.version, '-v, --version', 'Output the version number')
    .option('-i, --init', 'Read all .pot files from project and save all strings in the translate.pot file')
    .option('-f, --fill-translate-file', 'Read all translated strings and fill the translate.pot file')
    .option('-t, --translate', 'Translate project with translate.pot file')
    .option('-l, --lang <lang>', 'Translation language', 'fa')
    .parse(args);

  return program;
}
