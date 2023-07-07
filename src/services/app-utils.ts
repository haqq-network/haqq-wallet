import {NativeModules} from 'react-native';

const {RNAppUtils} = NativeModules;

export const AppUtils = {
  /**
   * @description It will open the previous application if HAQQ Wallet was opened using a deeplink
   */
  goBack() {
    RNAppUtils.goBack();
  },
};
