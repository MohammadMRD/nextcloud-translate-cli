import { spawn } from 'child_process';
import readPotFiles from './read-pot-files';

export function cli(args) {
  // Fetch all strings
  console.log('******** Create po files ********\r\n');
  const createPotFiles = spawn('php', [`${__dirname}/translationtool.phar`, 'create-pot-files']);

  createPotFiles.stdout.on('data', () => {
    console.log('*********************************');
    readPotFiles();
  });

  createPotFiles.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
    console.log('*********************************');
  });

  createPotFiles.on('error', (error) => {
    console.log(`error: ${error.message}`);
    console.log('*********************************');
  });
}
