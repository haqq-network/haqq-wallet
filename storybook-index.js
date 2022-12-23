/**
 * @format
 */
import {AppRegistry} from 'react-native';
import React from 'react';
import {name as appName} from './app.json';
import {View} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import StoryBookApp from './App';

SplashScreen.hide();
AppRegistry.registerComponent(appName, () => StoryBookApp);
AppRegistry.registerComponent('overview', () => () => <View />);
