import en from '../../assets/locales/en/en.json';

export function getText<Key extends keyof typeof en>(key: Key): string {
  return en[key];
}
