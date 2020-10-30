import { Command } from 'commander';

import packageJson from '../package.json';

export default function (args) {
  const program = new Command();

  program
    .version(packageJson.version)
    .option('-i, --init', 'Read all .pot files from project and save all strings in the translate.pot file')
    .option('-f, --fill-translate-file', 'Read all translated strings and fill the translate.pot file')
    .parse(args);

  return program;
}
