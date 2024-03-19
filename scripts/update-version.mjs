#!/usr/bin/env zx
import {$, argv} from 'zx';

await $`yarn env:verify`;
await $`yarn plugin import version`.quiet();

const flags = ['major', 'minor', 'patch'];
const args = argv._.length > 0 ? argv._ : ['patch'];

for (const flag of flags) {
  if (args.includes(flag)) {
    await $`yarn version ${flag}`.quiet();
  }
}

const packageJson = require('../package.json');
await $`sed -i '' 's/^APP_VERSION=.*/APP_VERSION=${packageJson.version}/' .env`.quiet();
