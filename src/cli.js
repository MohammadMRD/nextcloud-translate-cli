import initProgram from './init-program';
import readPotFiles from './read-pot-files';
import fillTranslateFile from './fill-translate-file';
import translateProject from './translate-project';

export function cli(args) {
  // Init program
  const program = initProgram(args);

  if (program.init) {
    readPotFiles();
  } else if (program.fillTranslateFile) {
    fillTranslateFile();
  } else if (program.translate) {
    translateProject();
  }
}
