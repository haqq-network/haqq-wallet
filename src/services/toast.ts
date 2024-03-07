import {Theme} from '@theme';
import {NativeModules} from 'react-native';

import {I18N, getText} from '@app/i18n';

const {RNToast} = NativeModules;

export const message = (msg: string) => {
  RNToast.message(msg, Theme.currentTheme);
};

export function sendNotification(text: I18N, params = {}) {
  message(getText(text, params));
}
