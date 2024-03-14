import {FOR_DETOX} from '@env';
import {NativeModules, ToastAndroid} from 'react-native';

import {app} from '@app/contexts';
import {I18N, getText} from '@app/i18n';
import {IS_ANDROID} from '@app/variables/common';

const {RNToast} = NativeModules;

export const message = (msg: string) => {
  if (IS_ANDROID) {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  } else {
    RNToast.message(msg, app.currentTheme);
  }
};

export function sendNotification(text: I18N, params = {}) {
  if (FOR_DETOX) {
    return;
  }
  message(getText(text, params));
}
