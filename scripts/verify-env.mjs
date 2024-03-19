#!/usr/bin/env zx
import {$} from 'zx';

const packageJson = require('../package.json');

try {
  await $`cat .env | grep APP_VERSION`.quiet();
} catch (err) {
  await $`echo -e "\nAPP_VERSION=${packageJson.version}" >> .env`.quiet();
}
