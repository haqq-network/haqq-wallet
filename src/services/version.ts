import {NativeModules} from 'react-native';

const {RNVersion} = NativeModules;

export const getAppVersion = () => RNVersion.appVersion;

export const getBuildNumber = () => RNVersion.buildNumber;

export const getAdId = () => RNVersion.adId;

export const getIsTrackingEnabled = () => RNVersion.isTrackingEnabled;

export const getUserAgent = () => RNVersion.userAgent;
