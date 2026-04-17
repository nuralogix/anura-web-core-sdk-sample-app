import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRANSLATIONS_DIR = path.resolve(__dirname, '../client/language');
const EXT = '.json';

function sortObjectByKey(obj) {
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
}

fs.readdirSync(TRANSLATIONS_DIR)
  .filter((file) => file.endsWith(EXT))
  .forEach((file) => {
    const fullPath = path.join(TRANSLATIONS_DIR, file);
    const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const sorted = sortObjectByKey(content);
    fs.writeFileSync(fullPath, JSON.stringify(sorted, null, 2), 'utf8');
    console.log(`✅ Sorted: ${file}`);
  });
