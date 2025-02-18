#!/usr/bin/env zx
require('dotenv').config();
import {$, fs, spinner} from 'zx';

let languagesList;

const fetchLanguagesList = async () => {
  languagesList = await fetch(`${process.env.HAQQ_BACKEND}languages`).then(
    data => data.json(),
  );
};

const fetchLocaleAndSave = async (id, hash) => {
  const keys = await fetch(
    `${process.env.HAQQ_BACKEND}languages/${id}.json`,
  ).then(data => data.json());
  const assetPath = `./assets/locales/${id}/${id}.json`;
  await fs.writeFile(assetPath, JSON.stringify({_hash: hash, ...keys}));
};

await spinner('Downloading locales list', fetchLanguagesList);

for (let language of languagesList) {
  const {id, hash} = language;
  await spinner(`Saving ${id}`, () => fetchLocaleAndSave(id, hash));
}

await spinner('Run linter', () => $`yarn lint:assets`);
