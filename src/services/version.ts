import {NativeModules} from 'react-native';

const {RNVersion} = NativeModules;

export const getAppVersion = () => RNVersion.appVersion as string;

export const getBuildNumber = () => RNVersion.buildNumber as string;

export const getAdId = () => RNVersion.adId as string;

export const getIsTrackingEnabled = () =>
  RNVersion.isTrackingEnabled as boolean;

export const getUserAgent = () => RNVersion.userAgent as string;
