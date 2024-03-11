import {FOR_DETOX} from '@env';
import {NativeModules} from 'react-native';

import {I18N, getText} from '@app/i18n';
import {Theme} from '@app/theme';

const {RNToast} = NativeModules;

export const message = (msg: string) => {
  RNToast.message(msg, Theme.currentTheme);
};

export function sendNotification(text: I18N, params = {}) {
  if (FOR_DETOX) {
    return;
  }
  message(getText(text, params));
}
