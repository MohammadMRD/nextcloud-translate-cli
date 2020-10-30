import fs from 'fs';
import path from 'path';
import PoFile from 'pofile';

export default function () {
  const root = process.cwd();
  const mainTranslateFilePath = path.join(root, 'translate', 'translate.pot');
  if (!fs.existsSync(mainTranslateFilePath)) {
    throw new Error('Could not find translate.pot file.');
  }

  console.log('******************************');
  console.log('Opening translate.po file');
  PoFile.load(mainTranslateFilePath, (err, translatePoFile) => {
    if (err) throw new Error(err);

    // List all directories
    console.log('Reading translated JSON files');
    const directories = ['lib', 'core'];
    fs.readdirSync(path.join(root, 'apps'), { withFileTypes: true })
      .filter((dir) => dir.isDirectory())
      .forEach((dir) => directories.push(path.join('apps', dir.name)));

    // Read translated files and fill translate.pot file

    // Copy strings
    console.log('Copying strings');
    directories.forEach((dir) => {
      const translatedFile = path.join(root, dir, 'l10n', 'fa.json');

      if (fs.existsSync(translatedFile)) {
        const faFile = fs.readFileSync(translatedFile);
        const { translations } = JSON.parse(faFile);

        if (!translations) return;

        Object.keys(translations).forEach((key) => {
          const faKey = String(key).normalize();
          const faValue = String(translations[faKey]).normalize();

          const tIndex = translatePoFile.items.findIndex(
            ({ msgid, msgid_plural, msgstr }) =>
              [msgid.normalize(), String(msgid_plural || '').normalize()].includes(faKey) &&
              !msgstr.find((str) => str.normalize() === faValue)
          );

          if (tIndex >= 0) {
            const { msgid, msgid_plural } = translatePoFile.items[tIndex];
            const strIndex =
              msgid.normalize() === faKey ? 0 : msgid_plural && msgid_plural.normalize() === faKey ? 1 : 0;

            translatePoFile.items[tIndex].msgstr[strIndex] = faValue;
          }
        });
      }
    });

    console.log('Saving translate.po file');
    translatePoFile.save(mainTranslateFilePath, (err) => {
      if (err) throw new Error(err);

      console.log('******************************');
    });
  });
}
