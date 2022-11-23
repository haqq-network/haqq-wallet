export enum I18N {
  backupCreateRecoveryPhrase,
  backupCreateRecoverySaveWords,
  backupCreateRecoveryWarningMessage,
  backupCreateRecoveryAgreement,
  ledgerBluetoothAllow,
  ledgerBluetoothTitleUnknown,
  ledgerBluetoothTitleDisabled,
  ledgerBluetoothDescriptionUnknown,
  ledgerBluetoothDescriptionDisabled,
  transactionLedgerBluetoothDisabled,
  transactionLedgerBluetoothConfirmation,
  createAgreementText,
  createAgreementTitle,
  createAgreementAgree,
  termsAgreement,
  termsPrivacyPolicy,
  restoreAgreementText,
  restoreAgreementTitle,
  restoreAgreementAgree,
  ledgerAgreementText,
  ledgerAgreementTitle,
  ledgerAgreementAgree,
  backupVerifyTitle,
  backupVerifyError,
  backupVerifyDescription,
  backupVerifyCheck,
  transactionContactEditHeaderTitle,
  transactionAddressPlaceholder,
  transactionAddressError,
  transactionAddressLabel,
  settingsAccountEditHeaderTitle,
  settingsContactEditHeaderTitle,
  settingsContactEditDeleteContact,
  copy,
  name,
  address,
  accept,
  cancel,
  save,
  edit,
  continue,
  actionSheetDiscard,
  actionSheetKeepEditing,
  actionSheetMessage,
  modalQRTitle,
  modalQRNoAccessTitle,
  modalQRNoAccessDescription,
  settingsThemeScreen,
  settingsThemeLight,
  settingsThemeDark,
  settingsThemeSystem,
  homeSettingsAbout,
  homeSettingsAccounts,
  homeSettingsAddressBook,
  homeSettingsAppearance,
  homeSettingsSecurity,
  homeSettingsProviders,
  homeSettingsFAQ,
  homeSettingsTest,
  homeSettingsLanguage,
  backupNotificationTitle,
  backupNotificationDescription,
  backupNotificationBackup,
  backupNotificationSkip,
  backupNotificationAlertTitle,
  backupNotificationAlertDescription,
  homeWallet,
  homeWalletTitle,
  homeSettings,
  homeSettingsTitle,
  modalPinTitle,
  modalPinForgotCode,
  pinManyAttempts,
}

export function getText(key: I18N, ...args: string[]): string {
  let str = en[key];
  if (args.length) {
    return str.replace('{0}', args[0]);
  }
  return str;
}

const en: Record<I18N, string> = {
  [I18N.backupCreateRecoveryPhrase]: 'Your recovery phrase',
  [I18N.backupCreateRecoverySaveWords]:
    'Write down or copy these words in the right order and save them somewhere safe.',
  [I18N.backupCreateRecoveryWarningMessage]:
    'If you lose your recovery phrase, you will be unable to access your funds, as nobody will be able to restore it.',
  [I18N.backupCreateRecoveryAgreement]:
    'I understand that if I lose my recovery phrase, I will not be able to restore access to my account',
  [I18N.ledgerBluetoothAllow]: 'Allow',
  [I18N.ledgerBluetoothTitleUnknown]: 'Allow using Bluetooth',
  [I18N.ledgerBluetoothTitleDisabled]: 'No access to Bluetooth',
  [I18N.ledgerBluetoothDescriptionUnknown]:
    'App uses bluetooth to find, connect and communicate with Ledger Nano devices',
  [I18N.ledgerBluetoothDescriptionDisabled]:
    'The app does not have access to your Bluetooth. Please go to your phone settings and allow the app to use Bluetooth. Without this, we will not be able to find your Ledger Nano X',
  [I18N.transactionLedgerBluetoothDisabled]: 'No access to Bluetooth',
  [I18N.transactionLedgerBluetoothConfirmation]:
    'Open Ethereum app on your Ledger and Confirm the transaction by pressing both buttons together',
  [I18N.createAgreementTitle]: 'Islm - DeFi Wallet',
  [I18N.createAgreementText]:
    'Islm Wallet does not store, transfer, transmit, convert, hold, or otherwise interact with any of the Virtual Currencies you may use with the Islm Wallet App. Any transfer or transaction occurs on the Haqq Network(s). Islm Wallet cannot block, freeze or take any kind of control over your Virtual Currency.',
  [I18N.createAgreementAgree]: 'Agree',
  [I18N.termsPrivacyPolicy]: 'Privacy Policy',
  [I18N.termsAgreement]: 'By clicking Agree you agree to ',
  // 'By clicking Agree you agree to the Terms of Service and',
  [I18N.restoreAgreementTitle]:
    'Do you have your recovery phrase or private key?',
  [I18N.restoreAgreementText]:
    'The recovery phrase is a 12-word phrase that you received when you created the wallet. A private key is a key created by you in the application',
  [I18N.restoreAgreementAgree]: 'Agree',
  [I18N.ledgerAgreementTitle]: 'Connect your Ledger',
  [I18N.ledgerAgreementText]:
    'If you have a Ledger Nano X, then you can connect it via Bluetooth to Islm Wallet. You will be able to manage funds from Ledger using Islm Wallet',
  [I18N.ledgerAgreementAgree]: 'Connect',
  [I18N.backupVerifyTitle]: 'Verify backup phrase',
  [I18N.backupVerifyError]: 'Ooops, mistake in one of the words',
  [I18N.backupVerifyDescription]:
    'Please choose the correct backup phrase according to the serial number',
  [I18N.backupVerifyCheck]: 'Check',
  [I18N.modalQRTitle]: 'Scan QR Code',
  [I18N.modalQRNoAccessTitle]: 'No access to the camera',
  [I18N.modalQRNoAccessDescription]:
    'The app does not have access to your camera. Please go to your phone settings and allow the app to use camera. Without this, we will not be able to scan QR Code',
  [I18N.transactionContactEditHeaderTitle]: 'Edit Contact',
  [I18N.transactionAddressPlaceholder]: 'Address (0x) or contact name',
  [I18N.transactionAddressError]: 'Incorrect address',
  [I18N.transactionAddressLabel]: 'Send to',
  [I18N.settingsAccountEditHeaderTitle]: 'Edit account name',
  [I18N.settingsContactEditHeaderTitle]: 'Contact',
  [I18N.settingsContactEditDeleteContact]: 'Delete Contact',
  [I18N.copy]: 'Copy',
  [I18N.name]: 'Name',
  [I18N.address]: 'Address',
  [I18N.accept]: 'Accept',
  [I18N.cancel]: 'Cancel',
  [I18N.save]: 'Save',
  [I18N.edit]: 'Edit',
  [I18N.continue]: 'Continue',
  [I18N.actionSheetDiscard]: 'Discard Changes',
  [I18N.actionSheetKeepEditing]: 'Keep Editing',
  [I18N.actionSheetMessage]: 'Are you sure you want to discard your changes?',
  [I18N.settingsThemeScreen]: 'Appearance',
  [I18N.settingsThemeLight]: 'Light',
  [I18N.settingsThemeDark]: 'Dark',
  [I18N.settingsThemeSystem]: 'System',
  [I18N.homeSettingsAbout]: 'About',
  [I18N.homeSettingsAccounts]: 'Manage accounts',
  [I18N.homeSettingsAddressBook]: 'Address book',
  [I18N.homeSettingsAppearance]: 'Appearance',
  [I18N.homeSettingsSecurity]: 'Security',
  [I18N.homeSettingsProviders]: 'Providers',
  [I18N.homeSettingsFAQ]: 'FAQ',
  [I18N.homeSettingsTest]: 'Test',
  [I18N.homeSettingsLanguage]: 'Language',
  [I18N.backupNotificationTitle]: 'Backup your wallet, keep your assets safe',
  [I18N.backupNotificationDescription]:
    "If your recovery phrase is misplaced or stolen, it's the equivalent of osing your wallet. It's the only way to access your wallet if you forget your account password.",
  [I18N.backupNotificationBackup]: 'Backup now',
  [I18N.backupNotificationSkip]: 'I will risk it',
  [I18N.backupNotificationAlertTitle]: 'Proceed without backup?',
  [I18N.backupNotificationAlertDescription]:
    'If you lose access to your wallet, we will not be able to restore your wallet if you do not make a backup',
  [I18N.modalPinTitle]: 'Welcome to ISLM Wallet',
  [I18N.modalPinForgotCode]: 'Forgot\nthe code',
  [I18N.pinManyAttempts]: 'Too many attempts, please wait for {0}',
  [I18N.homeWallet]: 'Wallet',
  [I18N.homeWalletTitle]: 'Your wallets',
  [I18N.homeSettings]: 'Settings',
  [I18N.homeSettingsTitle]: 'Settings',
};
