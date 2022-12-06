export enum I18N {
  backupCreateRecoveryPhrase,
  backupCreateRecoverySaveWords,
  backupCreateRecoveryWarningMessage,
  backupCreateRecoveryAgreement,
  backupWarningButton,
  backupWarningInfoBlock1,
  backupWarningInfoBlock2,
  backupWarningTitle,
  backupWarningParagraph,
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
  trackActivityTitle,
  trackActivityImprovement,
  trackActivityImprovementDescription,
  trackActivityPrivacy,
  trackActivityPrivacyDescription,
  settingsAccountEditHeaderTitle,
  settingsContactEditHeaderTitle,
  settingsContactEditDeleteContact,
  copy,
  name,
  address,
  accept,
  cancel,
  save,
  share,
  edit,
  continue,
  actionSheetDiscard,
  actionSheetKeepEditing,
  actionSheetMessage,
  modalQRTitle,
  modalQRNoAccessTitle,
  modalQRNoAccessDescription,
  modalQRSendFunds,
  modalDetailsQRWarning,
  modalDetailsQRReceive,
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
  homeStaking,
  homeStakingEmpty,
  homeStakingUnbounded,
  homeStakingStaked,
  homeStakingRewards,
  homeStakingTitle,
  homeGovernance,
  homeGovernanceTitle,
  modalPinTitle,
  modalPinForgotCode,
  notificationCopied,
  notificationAccountDeleted,
  notificationAccountHidden,
  notificationPinChanged,
  pinManyAttempts,
  settingsProvidersTitle,
  settingsProvidersTitleRight,
  settingsProviderEditHeaderTitle,
  settingsProviderEditName,
  settingsProviderEditEthEndpoint,
  settingsProviderEditEthChainId,
  settingsProviderEditExplorer,
  settingsProviderEditCosmosEndpoint,
  settingsProviderEditCosmosChainId,
  settingsProviderEditDeleteProvider,
  settingsProviderEditUseProvider,
  settingsTestDelegate,
  settingsTestReward,
  settingsTestStaked,
  settingsTestUnbounded,
  settingsTestUndelegate,
  stakingValidators,
  stakingValidatorsRowPower,
  stakingValidatorsRowStaked,
  stakingValidatorsRowReward,
  stakingValidatorsRowWithdrawal,
  stakingValidatorsStaked,
  stakingValidatorsUnStaked,
  stakingInfo,
  stakingInfoAddress,
  stakingInfoDetail,
  stakingInfoVotingPower,
  stakingInfoCommission,
  stakingInfoCommissionCurrent,
  stakingInfoCommissionMax,
  stakingInfoCommissionMaxChange,
  stakingInfoGetReward,
  stakingInfoWebsite,
  stakingInfoDelegate,
  stakingInfoUnDelegate,
  stakingInfoInactive,
  StakingInfoUnDelegationDays,
  StakingInfoUnDelegationDay,
  validatorStatusActive,
  validatorStatusInactive,
  validatorStatusJailed,
  validatorInfoReward,
  validatorInfoStaked,
  validatorInfoUndelegateInProcess,
  validatorInfoShowOther,
  validatorInfoHide,
  stakingDelegateFormTitle,
  stakingDelegateFormStakeTo,
  stakingDelegateFormNetworkFee,
  stakingDelegateFormCommission,
  stakingDelegateFormPreview,
  stakingDelegateFormWrongSymbol,
  stakingDelegateFormNotEnough,
  stakingDelegateAccountTitle,
  stakingDelegatePreviewTitle,
  stakingDelegatePreviewTotalAmount,
  stakingDelegatePreviewStakeTo,
  stakingDelegatePreviewCommission,
  stakingDelegatePreviewAmount,
  stakingDelegatePreviewNetworkFee,
  stakingDelegatePreviewDelegate,
  stakingDelegatePreviewAttention,
  stakingDelegateFinishTitle,
  stakingDelegateFinishTotalAmount,
  stakingDelegateFinishDone,
  stakingUnDelegateFormTitle,
  stakingUnDelegateFormWrongSymbol,
  stakingUnDelegateFormNotEnough,
  stakingUnDelegateFormPreview,
  stakingUnDelegateFormCommission,
  stakingUnDelegateFormNetworkFee,
  stakingUnDelegateAccountTitle,
  stakingUnDelegatePreviewTitle,
  stakingUnDelegatePreviewTotalAmount,
  stakingUnDelegatePreviewWithdrawFrom,
  stakingUnDelegatePreviewCommission,
  stakingUnDelegatePreviewAmount,
  stakingUnDelegatePreviewNetworkFee,
  stakingUnDelegatePreviewButton,
  stakingUnDelegatePreviewAttention,
  stakingUnDelegateFinishTitle,
  stakingUnDelegateFinishTotalAmount,
  stakingUnDelegateFinishDone,
  stakingUnDelegateSumWarning,
  stakingHomeValidators,
  stakingHomeGetRewards,
  sumBlockMax,
  sumBlockAvailable,
  popupNotificationTitle,
  popupNotificationDescription,
  popupNotificationTurnOn,
  popupNotificationNotNow,
  notificationRewardReceived,
  welcomeTitle,
  welcomeDescription,
  welcomeCreateWallet,
  welcomeLedgerWallet,
  welcomeRestoreWallet,
  settingsAccountDetailRenameTitle,
  settingsAccountDetailRenameSubtitle,
  settingsAccountDetailChangeStyleTitle,
  settingsAccountDetailChangeStyleSubtitle,
  settingsAccountDetailHideSubtitle,
  settingsAccountDetailHideTitle,
  backupFinishCongratulation,
  backupFinishSuccess,
  backupFinishFinish,
  proposalTitle,
}

export function getText(key: I18N, params?: Record<string, string>): string {
  let str = en[key];
  if (params) {
    return Object.entries(params).reduce(
      (memo, [k, v]) => memo.replace(`{{${k}}}`, v),
      str,
    );
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
  [I18N.backupWarningButton]: 'Understood',
  [I18N.backupWarningInfoBlock1]:
    'If you lose your recovery phrase, you will be unable to access your funds, as nobody will be able to restore it.',
  [I18N.backupWarningInfoBlock2]:
    'This phrase is your only chance to recover access to your funds if your usual device is unavailable to you.',
  [I18N.backupWarningTitle]: 'Important about backup',
  [I18N.backupWarningParagraph]:
    'A backup is a restoring phrase of 12 words. It is better to write down the phrase on paper and not keep it online.',
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
    'The recovery phrase is a 12-word phrase that you received when you created the account. A private key is a key created by you in the application',
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
  [I18N.modalQRSendFunds]: 'Send funds from',
  [I18N.modalDetailsQRWarning]:
    'Only ISLM related assets on HAQQ network are supported.',
  [I18N.modalDetailsQRReceive]: 'Receive',
  [I18N.transactionContactEditHeaderTitle]: 'Edit Contact',
  [I18N.transactionAddressPlaceholder]: 'Address (0x) or contact name',
  [I18N.transactionAddressError]: 'Incorrect address',
  [I18N.transactionAddressLabel]: 'Send to',
  [I18N.trackActivityTitle]: 'Allow ISLM Wallet track your activity',
  [I18N.trackActivityImprovement]: 'Improvement',
  [I18N.trackActivityImprovementDescription]:
    'This will help us to collect more information about the problems of the application',
  [I18N.trackActivityPrivacy]: 'Security and privacy',
  [I18N.trackActivityPrivacyDescription]:
    'We securely store the data we receive. All data is non-personalized',
  [I18N.settingsAccountEditHeaderTitle]: 'Edit account name',
  [I18N.settingsContactEditHeaderTitle]: 'Contact',
  [I18N.settingsContactEditDeleteContact]: 'Delete Contact',
  [I18N.copy]: 'Copy',
  [I18N.name]: 'Name',
  [I18N.address]: 'Address',
  [I18N.accept]: 'Accept',
  [I18N.cancel]: 'Cancel',
  [I18N.save]: 'Save',
  [I18N.share]: 'Share',
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
  [I18N.backupNotificationTitle]: 'Backup your account, keep your assets safe',
  [I18N.backupNotificationDescription]:
    "If your recovery phrase is misplaced or stolen, it's the equivalent of losing your wallet. It's the only way to access your wallet if you forget your account password.",
  [I18N.backupNotificationBackup]: 'Backup now',
  [I18N.backupNotificationSkip]: 'I will risk it',
  [I18N.backupNotificationAlertTitle]: 'Proceed without backup?',
  [I18N.backupNotificationAlertDescription]:
    'If you lose access to your wallet, we will not be able to restore your account if you do not make a backup',
  [I18N.modalPinTitle]: 'Welcome to ISLM Wallet',
  [I18N.notificationCopied]: 'Copied',
  [I18N.notificationAccountDeleted]: 'The account has been deleted',
  [I18N.notificationAccountHidden]: 'The account was hidden',
  [I18N.notificationPinChanged]: 'PIN code successfully changed',
  [I18N.modalPinForgotCode]: 'Forgot\nthe code',
  [I18N.pinManyAttempts]: 'Too many attempts, please wait for {{attempts}}',
  [I18N.homeWallet]: 'Accounts',
  [I18N.homeWalletTitle]: 'Your accounts',
  [I18N.homeSettings]: 'Settings',
  [I18N.homeSettingsTitle]: 'Settings',
  [I18N.homeStaking]: 'Staking',
  [I18N.homeStakingEmpty]:
    'Stake your ISLM in any validator and get additional ISLM',
  [I18N.homeStakingUnbounded]: 'Unbounded',
  [I18N.homeStakingTitle]: 'Staking',
  [I18N.homeGovernance]: 'Governance',
  [I18N.homeGovernanceTitle]: 'Governance',
  [I18N.homeStakingStaked]: 'Staked',
  [I18N.homeStakingRewards]: 'Rewards',
  [I18N.settingsProvidersTitle]: 'Providers',
  [I18N.settingsProvidersTitleRight]: 'Add',
  [I18N.settingsProviderEditHeaderTitle]: 'Provider',
  [I18N.settingsProviderEditName]: 'Name',
  [I18N.settingsProviderEditEthEndpoint]: 'Etherium RPC endpoint',
  [I18N.settingsProviderEditEthChainId]: 'Etherium chain id',
  [I18N.settingsProviderEditExplorer]: 'Explorer (optional)',
  [I18N.settingsProviderEditCosmosEndpoint]: 'Cosmos RPC endpoint',
  [I18N.settingsProviderEditCosmosChainId]: 'Cosmos chain id',
  [I18N.settingsProviderEditDeleteProvider]: 'Delete Provider',
  [I18N.settingsTestDelegate]: 'Delegate',
  [I18N.settingsTestReward]: 'Reward: {{reward}}',
  [I18N.settingsTestStaked]: 'Staked: {{staked}}',
  [I18N.settingsTestUnbounded]: 'Unbounded: {{unbounded}}',
  [I18N.settingsTestUndelegate]: 'Undelegate',
  [I18N.settingsProviderEditUseProvider]: 'Use this provider',
  [I18N.stakingValidators]: 'Validators list',
  [I18N.stakingValidatorsRowPower]: 'Power: {{power}}',
  [I18N.stakingValidatorsRowStaked]: 'Staked: {{staked}}',
  [I18N.stakingValidatorsRowReward]: 'Reward: {{reward}}',
  [I18N.stakingValidatorsRowWithdrawal]: 'Withdrawal in process',
  [I18N.stakingValidatorsStaked]: 'Staked',
  [I18N.stakingValidatorsUnStaked]: 'Unstaked',
  [I18N.stakingInfo]: 'Validator info',
  [I18N.stakingInfoAddress]: 'Address',
  [I18N.stakingInfoDetail]: 'Detail',
  [I18N.stakingInfoVotingPower]: 'Voting power',
  [I18N.stakingInfoCommission]: 'Commission',
  [I18N.stakingInfoWebsite]: 'Website',
  [I18N.stakingInfoGetReward]: 'Get reward',
  [I18N.stakingInfoDelegate]: 'Delegate',
  [I18N.stakingInfoUnDelegate]: 'Undelegate',
  [I18N.stakingInfoCommissionCurrent]: 'Current',
  [I18N.stakingInfoCommissionMax]: 'Max',
  [I18N.stakingInfoCommissionMaxChange]: 'Max change',
  [I18N.stakingInfoInactive]:
    'While the validator is inactive, you will not be able to receive a reward.',
  [I18N.StakingInfoUnDelegationDays]: ' ({{days}} days left)',
  [I18N.StakingInfoUnDelegationDay]: ' ({{day}} day left)',
  [I18N.validatorStatusActive]: 'Active',
  [I18N.validatorStatusInactive]: 'Inactive',
  [I18N.validatorStatusJailed]: 'Jailed',
  [I18N.validatorInfoReward]: 'Reward',
  [I18N.validatorInfoStaked]: 'Staked',
  [I18N.validatorInfoUndelegateInProcess]: 'Undelegate in process',
  [I18N.validatorInfoShowOther]: 'Show other',
  [I18N.validatorInfoHide]: 'Hide',
  [I18N.stakingDelegateFormTitle]: 'Stake',
  [I18N.stakingDelegateFormTitle]: 'Delegate',
  [I18N.stakingDelegateFormStakeTo]: 'Stake to',
  [I18N.stakingDelegateFormNetworkFee]: 'Network fee',
  [I18N.stakingDelegateFormCommission]: 'Commission',
  [I18N.stakingDelegateFormPreview]: 'Preview',
  [I18N.stakingDelegateFormWrongSymbol]: 'Wrong symbol',
  [I18N.stakingDelegateFormNotEnough]: "You don't have enough funds",
  [I18N.stakingDelegatePreviewTitle]: 'Preview',
  [I18N.stakingDelegatePreviewTotalAmount]: 'Total Amount',
  [I18N.stakingDelegatePreviewStakeTo]: 'Stake to',
  [I18N.stakingDelegatePreviewCommission]: 'Commission',
  [I18N.stakingDelegatePreviewAmount]: 'Amount',
  [I18N.stakingDelegatePreviewNetworkFee]: 'Network fee',
  [I18N.stakingDelegatePreviewDelegate]: 'Delegate',
  [I18N.stakingDelegatePreviewAttention]:
    'Attention! If in the future you want to withdraw the staked funds, it will take 21 days',
  [I18N.stakingDelegateAccountTitle]: 'Account',
  [I18N.stakingDelegateFinishTitle]: 'Delegate Completed',
  [I18N.stakingDelegateFinishTotalAmount]: 'Total Amount',
  [I18N.stakingDelegateFinishDone]: 'Done',
  [I18N.stakingUnDelegateFormTitle]: 'Undelegate',
  [I18N.stakingUnDelegateFormNetworkFee]: 'Network fee',
  [I18N.stakingUnDelegateFormCommission]: 'Commission',
  [I18N.stakingUnDelegateFormPreview]: 'Preview',
  [I18N.stakingUnDelegateFormWrongSymbol]: 'Wrong symbol',
  [I18N.stakingUnDelegateFormNotEnough]: "You don't have enough funds",
  [I18N.stakingUnDelegatePreviewTitle]: 'Preview',

  [I18N.stakingUnDelegatePreviewTotalAmount]: 'Total Amount',
  [I18N.stakingUnDelegatePreviewWithdrawFrom]: 'Withdrawal from',
  [I18N.stakingUnDelegatePreviewCommission]: 'Commission',
  [I18N.stakingUnDelegatePreviewAmount]: 'Amount',
  [I18N.stakingUnDelegatePreviewNetworkFee]: 'Network fee',
  [I18N.stakingUnDelegatePreviewButton]: 'Undelegate',
  [I18N.stakingUnDelegatePreviewAttention]:
    'Attention! If in the future you want to undelegate the staked funds, it will take 21 days',

  [I18N.stakingUnDelegateFinishTitle]: 'Undelegate started',
  [I18N.stakingUnDelegateFinishTotalAmount]: 'Total Amount',
  [I18N.stakingUnDelegateFinishDone]: 'Done',

  [I18N.stakingHomeValidators]: 'Validators',
  [I18N.stakingHomeGetRewards]: 'Get rewards',

  [I18N.stakingUnDelegateAccountTitle]: 'Account',
  [I18N.stakingUnDelegateSumWarning]:
    'The funds will be undelegate within 21 days',
  [I18N.sumBlockMax]: 'Max',
  [I18N.sumBlockAvailable]: 'Available',
  [I18N.popupNotificationTitle]: 'Turn on push notifications',
  [I18N.popupNotificationDescription]:
    'We can notify you when something important happens, such as: The transaction was successfully sent. Funds have arrived in the wallet. We detect any risks for the security of your account',
  [I18N.popupNotificationTurnOn]: 'Turn on notifications',
  [I18N.popupNotificationNotNow]: 'Not now',
  [I18N.notificationRewardReceived]: 'The reward is received',
  [I18N.welcomeTitle]: 'No account is connected',
  [I18N.welcomeDescription]:
    'You can create a new account or connect any existing\u00A0one',
  [I18N.welcomeCreateWallet]: 'Create Account',
  [I18N.welcomeLedgerWallet]: 'Connect',
  [I18N.welcomeRestoreWallet]: 'I already have a wallet',
  [I18N.settingsAccountDetailRenameTitle]: 'Rename account',
  [I18N.settingsAccountDetailRenameSubtitle]: 'Change the account display name',
  [I18N.settingsAccountDetailChangeStyleTitle]: 'Change style',
  [I18N.settingsAccountDetailChangeStyleSubtitle]:
    'Change the picture of the account',
  [I18N.settingsAccountDetailHideTitle]: 'Hide account',
  [I18N.settingsAccountDetailHideSubtitle]:
    'Will be hidden from the general list',
  [I18N.welcomeRestoreWallet]: 'I already have an account',
  [I18N.backupFinishCongratulation]: 'Congratulations!',
  [I18N.backupFinishSuccess]: "You've successfully protected your account.",
  [I18N.backupFinishFinish]: 'Finish',
  [I18N.proposalTitle]: 'Proposal',
};
