import {NativeModules} from 'react-native';

const {RNVersion} = NativeModules;

export const getAppVersion = () => RNVersion.appVersion;

export const getBuildNumber = () => RNVersion.buildNumber;
