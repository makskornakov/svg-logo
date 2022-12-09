import fs from 'fs/promises';
import path from 'path';

import filenames from '../filenames.json' assert { type: 'json' };

const args = process.argv.slice(2);
const workingDirRelative = args[0];

const files = await fs.readdir(workingDirRelative);

const filesInDirectory = files.map((filename) => `./${path.join(workingDirRelative, filename)}`);

const fileContentPrevious = await fs.readFile(filenames.workingFileRelative, { encoding: 'utf-8' });
let fileContentNew = fileContentPrevious;

filesInDirectory.forEach((filename) => {
  const relevantRegex = filenames.filenamesRegexes.find((regex) =>
    new RegExp(regex).test(filename),
  );
  if (!relevantRegex) return;

  const previousFilename = fileContentPrevious.match(new RegExp(relevantRegex));
  if (previousFilename?.[0] && previousFilename[0] === filename) return;

  console.log(`${relevantRegex} => ${filename}`);
  fileContentNew = fileContentNew.replace(new RegExp(relevantRegex), filename);
});

await Promise.all([
  fileContentPrevious !== fileContentNew
    ? fs.writeFile(filenames.workingFileRelative, fileContentNew)
    : undefined,
  fs.rm('./filenames.json'),
]);

const filenamesToCreateSymlinks = filesInDirectory.filter(filename => path.basename(filename) !== 'index.html');
await Promise.all(filenamesToCreateSymlinks.map((filename) => {
  const originalFilename = getOriginalFileName(filename);
  console.log(`copying '${filename}' to '${originalFilename}'`);
  return fs.copyFile(filename, originalFilename);
}))

/**
 * `./dist/Logo-1.ec6c2488.svg` => `./dist/Logo-1.svg`;
 * @param {string} filename
 */
function getOriginalFileName(filename) {
  const splitted = filename.split('.');
  splitted.splice(-2, 1); // remove the hash part;
  return splitted.join('.');
}
