/**
 * @format
 */
import {AppRegistry} from 'react-native';

import {name as appName} from './app.json';

import SplashScreen from 'react-native-splash-screen';
import StoryBookApp from './App';

SplashScreen.hide();
AppRegistry.registerComponent(appName, () => StoryBookApp);
