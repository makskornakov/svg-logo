import fs from 'fs/promises';

const args = process.argv.slice(2);
const workingFileRelative = args[0];

const fileContent = await fs.readFile(workingFileRelative, { encoding: 'utf-8' });

// console.log('content', fileContent);

const regex = /src="(.*).svg"/gim;

const allSrcs = fileContent.match(regex);

// console.log('all srcs', allSrcs);

const onlyFilenames = allSrcs.map((srcTag) => {
  const splitted = srcTag.split('"');
  splitted.shift();
  splitted.pop();
  return splitted.join('');
});

// console.log('names', onlyFilenames);

const filenamesRegexes = onlyFilenames.map((filename) => {
  const splitted = filename.split('.');
  // splitted.splice(-2, 1); // remove the hash part
  splitted[splitted.length - 2] = '(.*)';
  return splitted.join('\\.');
});

// console.log('filenamesRegexes', filenamesRegexes);

await fs.writeFile(
  'filenames.json',
  JSON.stringify({ workingFileRelative, filenamesRegexes }, undefined, 2),
);
