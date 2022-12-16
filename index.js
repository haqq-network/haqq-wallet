/**
 * @format
 */
import {AppRegistry} from 'react-native';

import {name as appName} from './app.json';
import {STORYBOOK_ENABLED} from '@env';

import SplashScreen from 'react-native-splash-screen';
import StoryBookApp from './App';

if (STORYBOOK_ENABLED === '1') {
  SplashScreen.hide();
  AppRegistry.registerComponent(appName, () => StoryBookApp);
} else {
  //require('./default-index');
}
