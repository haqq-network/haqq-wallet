import {NativeModules} from 'react-native';

export enum BooleanConfigKey {
  systemDialogEnabled = 'systemDialogEnabled',
}

export class AppNativeConfig {
  static setBoolean(key: BooleanConfigKey, value: boolean): Promise<void> {
    return NativeModules.AppNativeConfig.setBoolean(value, key);
  }

  static getBoolean(key: BooleanConfigKey): Promise<boolean> {
    return NativeModules.AppNativeConfig.getBoolean(key);
  }
}
