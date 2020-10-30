import fs from 'fs';
import path from 'path';
import PoFile from 'pofile';

export default function (lang) {
  const root = process.cwd();
  const mainTranslateFilePath = path.join(root, 'translate', `${lang}.pot`);
  if (!fs.existsSync(mainTranslateFilePath)) {
    throw new Error(`Could not find ${lang}.pot file.`);
  }

  console.log('******************************');
  console.log(`Opening ${lang}.pot file`);
  PoFile.load(mainTranslateFilePath, (err, translatePoFile) => {
    if (err) throw new Error(err);

    // List all directories
    console.log('Reading translated JSON files');
    const directories = ['lib', 'core'];
    fs.readdirSync(path.join(root, 'apps'), { withFileTypes: true })
      .filter((dir) => dir.isDirectory())
      .forEach((dir) => directories.push(path.join('apps', dir.name)));

    // Copy strings
    console.log('Copying strings');
    directories.forEach((dir) => {
      const translatedFile = path.join(root, dir, 'l10n', `${lang}.json`);

      if (fs.existsSync(translatedFile)) {
        const tFile = fs.readFileSync(translatedFile);
        const { translations } = JSON.parse(tFile);

        if (!translations) return;

        Object.keys(translations).forEach((key) => {
          const tKey = String(key).normalize();
          const tValue = String(translations[tKey]).normalize();

          const tIndex = translatePoFile.items.findIndex(
            ({ msgid, msgid_plural, msgstr }) =>
              [msgid.normalize(), String(msgid_plural || '').normalize()].includes(tKey) &&
              !msgstr.find((str) => str.normalize() === tValue)
          );

          if (tIndex >= 0) {
            const { msgid, msgid_plural } = translatePoFile.items[tIndex];
            const strIndex = msgid.normalize() === tKey ? 0 : msgid_plural && msgid_plural.normalize() === tKey ? 1 : 0;

            translatePoFile.items[tIndex].msgstr[strIndex] = tValue;
          }
        });
      }
    });

    console.log(`Saving ${lang}.pot file`);
    translatePoFile.save(mainTranslateFilePath, (err) => {
      if (err) throw new Error(err);

      console.log('******************************');
    });
  });
}
