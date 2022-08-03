/**
 * @format
 */

import {AppRegistry} from 'react-native';
import {App} from './src/app';
import {name as appName} from './app.json';

if (typeof Buffer === 'undefined') global.Buffer = require('buffer').Buffer;

AppRegistry.registerComponent(appName, () => App);
