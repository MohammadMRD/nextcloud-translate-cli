import fs from 'fs';
import path from 'path';
import PoFile from 'pofile';
import { spawn } from 'child_process';

export default function (lang) {
  console.log('******************************');
  console.log('Create pot files');

  const createPotFiles = spawn('php', [`${__dirname}/translationtool.phar`, 'create-pot-files']);

  createPotFiles.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  createPotFiles.on('error', (error) => {
    console.log(`error: ${error.message}`);
  });

  createPotFiles.on('close', (code) => {
    if (code == 0) {
      translateProject(lang);
    }

    console.log('******************************');
  });
}

function translateProject(lang) {
  const root = process.cwd();
  const mainTranslateFilePath = path.join(root, 'translate', `${lang}.pot`);
  const translationDir = path.join(root, 'translationfiles', 'templates');

  if (!fs.existsSync(mainTranslateFilePath)) {
    throw new Error(`Could not find ${lang}.pot file.`);
  }

  if (!fs.existsSync(translationDir)) {
    throw new Error('Could not find translation folder. (translationfiles/template)');
  }

  console.log(`Opening ${lang}.pot file`);
  PoFile.load(mainTranslateFilePath, (err, translatePoFile) => {
    if (err) throw new Error(err);

    fs.readdir(translationDir, (err, fileNames) => {
      if (err) throw new Error(err);

      // TODO: Log errorFiles
      const errorFiles = [];

      fileNames.forEach((fileName) => {
        console.log(`**** Updating ${fileName}`);

        PoFile.load(path.join(translationDir, fileName), (err, poFile) => {
          if (err) {
            errorFiles.push(`${translationDir}${fileName}`);
            return;
          }

          poFile.items.forEach((item, index) => {
            const translatedItem = translatePoFile.items.find((i) => i.msgid.normalize() === item.msgid.normalize());

            if (translatedItem) {
              poFile.items[index].msgstr = translatedItem.msgstr;
            }
          });

          console.log(`**** Saving ${fileName}`);
          const fileNameWithoutExt = fileName.split('.').slice(0, -1).join('.');
          let appPath = path.join(root, fileNameWithoutExt);

          if (!fs.existsSync(appPath)) {
            appPath = path.join(root, 'apps', fileNameWithoutExt);
          }

          const destPath = path.join(appPath, 'translationfiles', lang);
          if (!fs.existsSync(path.join(destPath))) {
            fs.mkdirSync(destPath, { recursive: true });
          }

          // Update Plural-Forms
          poFile.headers['Plural-Forms'] = 'nplurals=2; plural=(n != 1);';

          // Save File
          poFile.save(path.join(destPath, `${fileNameWithoutExt}.po`), (err) => {
            if (err) {
              return console.log(`Could not update ${fileName} file.`);
            }

            convertPoFile(appPath, fileName);
          });
        });
      });
    });
  });
}

function convertPoFile(path, fileName) {
  console.log(`**** Converting ${fileName} file`);

  const createPotFiles = spawn('php', [`${__dirname}/translationtool.phar`, 'convert-po-files'], { cwd: path });
  createPotFiles.on('close', () => {
    console.log('**** Converted: ', fileName);
  });
}
