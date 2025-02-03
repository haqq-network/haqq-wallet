import {by, element} from 'detox';

import {isIOS} from '../test-variables';

export enum SYSTEM_DIALOG_BUTTONS {
  ALLOW = 'Allow',
  OK = 'OK',
  CANCEL = 'Cancel',
  ASK_APP_NOT_TO_TRACK = 'Ask App Not to Track',
}

/**
 * Detects a system dialog button by label
 */
export function systemDialog(label: SYSTEM_DIALOG_BUTTONS) {
  if (isIOS()) {
    return element(by.label(label)).atIndex(0);
  }

  return element(by.text(label));
}
