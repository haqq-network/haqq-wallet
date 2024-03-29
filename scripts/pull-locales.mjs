#!/usr/bin/env zx
import {$} from 'zx';
require('dotenv').config();

await $`brew tap lokalise/cli-2 && brew install lokalise2`;
await $`lokalise2 --token ${process.env.LOCALISE_KEY} --project-id ${process.env.LOCALISE_PROJECT_ID} file download --format json --unzip-to ./assets/locales`;
