import fs from 'fs';
import { spawn } from 'child_process';
import PoFile from 'pofile';

export default function (lang) {
  // Fetch all strings
  console.log('******** Create po files ********\r\n');
  const createPotFiles = spawn('php', [`${__dirname}/translationtool.phar`, 'create-pot-files']);

  createPotFiles.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
    console.log('*********************************');
  });

  createPotFiles.on('error', (error) => {
    console.log(`error: ${error.message}`);
    console.log('*********************************');
  });

  createPotFiles.on('close', (code) => {
    if (code === 0) {
      readPotFiles(lang);
    }

    console.log('******************************');
  });
}

function readPotFiles(lang) {
  // Read all po files
  console.log('******* Read PO files ********');
  const currentPath = process.cwd();
  const translationDir = `${currentPath}/translationfiles/templates/`;
  const mainTranslateFolderPath = `${currentPath}/translate/`;
  const mainTranslateFileName = `${lang}.pot`;

  if (!fs.existsSync(mainTranslateFolderPath)) {
    fs.mkdirSync(mainTranslateFolderPath);
  }

  if (!fs.existsSync(`${mainTranslateFolderPath}${mainTranslateFileName}`)) {
    fs.writeFileSync(`${mainTranslateFolderPath}${mainTranslateFileName}`, '');
  }

  PoFile.load(`${mainTranslateFolderPath}${mainTranslateFileName}`, (err, mainPo) => {
    if (err) {
      console.log(`err: ${err}`);
      console.log('*********************************');
      return;
    }

    fs.readdir(translationDir, (err, filenames) => {
      if (err) {
        console.log(`err: ${err}`);
        console.log('*********************************');
        return;
      }

      // TODO: Log errorFiles
      const errorFiles = [];

      filenames.forEach((filename) => {
        console.log(`**** Reading ${filename}`);

        PoFile.load(`${translationDir}${filename}`, (err, poFile) => {
          if (err) {
            errorFiles.push(`${translationDir}${filename}`);
            return;
          }

          Object.keys(poFile.headers).forEach((headerKey) => {
            if (!mainPo.headers[headerKey]) {
              mainPo.headers[headerKey] = poFile.headers[headerKey];
            }
          });

          poFile.items.forEach((item) => {
            const itemIndex = mainPo.items.findIndex((i) => i.msgid.normalize() === item.msgid.normalize());

            if (itemIndex >= 0) {
              let mainItem = mainPo.items[itemIndex];

              item.references.forEach((ref) => {
                if (!mainItem.references.includes(ref)) {
                  mainItem.references.push(ref);
                }
              });

              item.comments.forEach((comment) => {
                if (!mainItem.comments.includes(comment)) {
                  mainItem.comments.push(comment);
                }
              });

              item.extractedComments.forEach((comment) => {
                if (!mainItem.extractedComments.includes(comment)) {
                  mainItem.extractedComments.push(comment);
                }
              });

              Object.keys(item.flags).forEach((flagKey) => {
                if (!mainItem.flags[flagKey]) {
                  mainItem.flags[flagKey] = item.flags[flagKey];
                }
              });

              mainPo.items[itemIndex] = mainItem;
              mainPo.items[itemIndex].msgid_plural = mainItem.msgid_plural || item.msgid_plural;
              mainPo.items[itemIndex].msgctxt = mainItem.msgctxt || item.msgctxt;
            } else {
              mainPo.items.push(item);
            }
          });

          mainPo.save(`${mainTranslateFolderPath}${mainTranslateFileName}`, (err) => {
            if (err) {
              console.log(`err: ${err}`);
            }
          });
        });
      });
    });
  });
}
