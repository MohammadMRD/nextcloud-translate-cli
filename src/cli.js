import initProgram from './init-program';
import readPotFiles from './read-pot-files';
import fillTranslateFile from './fill-translate-file';

export function cli(args) {
  // Init program
  const program = initProgram(args);

  if (program.init) {
    readPotFiles();
  }

  if (program.fillTranslateFile) {
    fillTranslateFile();
  }
}
