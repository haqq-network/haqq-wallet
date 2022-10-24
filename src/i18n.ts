export enum I18N {
  ledgerBluetoothAllow,
  ledgerBluetoothTitleUnknown,
  ledgerBluetoothTitleDisabled,
  ledgerBluetoothDescriptionUnknown,
  ledgerBluetoothDescriptionDisabled,
}

export function getText(key: I18N): string {
  return en[key];
}

const en: Record<I18N, string> = {
  [I18N.ledgerBluetoothAllow]: 'Allow',
  [I18N.ledgerBluetoothTitleUnknown]: 'Allow using Bluetooth',
  [I18N.ledgerBluetoothTitleDisabled]: 'No access to Bluetooth',
  [I18N.ledgerBluetoothDescriptionUnknown]:
    'App uses bluetooth to find, connect and communicate with Ledger Nano devices',
  [I18N.ledgerBluetoothDescriptionDisabled]:
    'The app does not have access to your Bluetooth. Please go to your phone settings and allow the app to use Bluetooth. Without this, we will not be able to find your Ledger Nano X',
};
