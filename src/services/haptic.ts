import {NativeModules} from 'react-native';

const {RNHaptic} = NativeModules;

export enum HapticEffects {
  selection = 'selection',
  success = 'success',
  warning = 'warning',
  error = 'error',
}

export const vibrate = (effect = HapticEffects.selection) => {
  RNHaptic.vibrate(effect);
};
