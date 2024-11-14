#!/usr/bin/env zx
import {$} from 'zx';

const config = require('../.devpkg.json');

/*
 * This script used to update devpkg packages types
 */
if (config.enabled) {
  Object.entries(config.packages).forEach(async ([name, {path}]) => {
    await $`rm -rf node_modules/${name}/dist`;
    await $`cp -r ${path}/dist node_modules/${name}/dist`;
  });
} else {
  console.log('devpkg is disabled');
}
