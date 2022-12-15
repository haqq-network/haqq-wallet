import {NativeModules} from 'react-native';

import {app} from '@app/contexts';

const {RNToast} = NativeModules;

export const message = (msg: string) => {
  RNToast.message(msg, app.getTheme());
};
