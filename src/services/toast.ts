import {Appearance, NativeModules} from 'react-native';

import {I18N, getText} from '@app/i18n';

const {RNToast} = NativeModules;

export const message = (msg: string) => {
  RNToast.message(msg, Appearance.getColorScheme());
};

export function sendNotification(text: I18N) {
  message(getText(text));
}
