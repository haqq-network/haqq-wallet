#!/usr/bin/env zx
require('dotenv').config();
import {$, fs, path, spinner} from 'zx';

await spinner(
  'Installing lozalise2 and jq',
  () => $`brew tap lokalise/cli-2 && brew install lokalise2 && brew install jq`,
);
await spinner(
  'Downloading locales',
  () =>
    $`lokalise2 --token ${process.env.LOCALISE_KEY} --project-id ${process.env.LOCALISE_PROJECT_ID} file download --format json --unzip-to ./assets/locales`,
);
await spinner('Run linter', () => $`yarn lint:assets`);

const localesDir = './assets/locales';
const folders = await fs.readdir(localesDir).then(result => result);
for await (const localeFolder of folders) {
  const localeFolderPath = path.join(localesDir, localeFolder);
  const noFileNamePath = `${localeFolderPath}/no_filename.json`;
  const localePath = `${localeFolderPath}/${localeFolder}.json`;
  const combinedPath = `${localeFolderPath}/temp.json`;
  await $`jq -s '.[0] * .[1]' ${noFileNamePath} ${localePath} > ${combinedPath}`.quiet();
  await $`mv ${combinedPath} ${localePath}`.quiet();
  await $`rm ${noFileNamePath}`.quiet();
}
