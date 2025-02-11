import {by, element} from 'detox';

import en from '../../assets/locales/en/en.json';

export function getText<Key extends keyof typeof en>(key: Key): string {
  return en[key];
}

export function getElementByText<Key extends keyof typeof en>(key: Key) {
  return element(by.text(getText(key)));
}
