import {NativeModules} from 'react-native';

import {app} from '@app/contexts';
import {I18N, getText} from '@app/i18n';

const {RNToast} = NativeModules;

export const message = (msg: string) => {
  RNToast.message(msg, app.currentTheme);
};

export function sendNotification(text: I18N) {
  message(getText(text));
}
