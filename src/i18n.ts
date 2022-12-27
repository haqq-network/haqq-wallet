import {getAppVersion, getBuildNumber} from '@app/services/version';

export enum I18N {
  empty,
  numericKeyboard0,
  numericKeyboard1,
  numericKeyboard2,
  numericKeyboard3,
  numericKeyboard4,
  numericKeyboard5,
  numericKeyboard6,
  numericKeyboard7,
  numericKeyboard8,
  numericKeyboard9,
  actionSheetDiscard,
  actionSheetKeepEditing,
  actionSheetMessage,
  backupCreateRecoveryPhrase,
  backupCreateRecoverySaveWords,
  backupCreateRecoveryWarningMessage,
  backupCreateRecoveryAgreement,
  backupCreateScreenshotWarningTitle,
  backupCreateScreenshotWarningSubtitle,
  backupCreateVerifyTitle,
  backupWarningButton,
  backupWarningInfoBlock1,
  backupWarningInfoBlock2,
  backupWarningTitle,
  backupWarningParagraph,
  backupNotificationTitle,
  backupNotificationDescription,
  backupNotificationBackup,
  backupNotificationSkip,
  backupNotificationAlertTitle,
  backupNotificationAlertDescription,
  backupVerifyTitle,
  backupVerifyError,
  backupVerifyDescription,
  backupVerifyCheck,
  createAgreementText,
  createAgreementTitle,
  createAgreementAgree,
  finishProceed,
  ledgerBluetoothAllow,
  ledgerBluetoothTitleUnknown,
  ledgerBluetoothTitleDisabled,
  ledgerBluetoothDescriptionUnknown,
  ledgerBluetoothDescriptionDisabled,
  restoreAgreementText,
  restoreAgreementTitle,
  restoreAgreementAgree,
  restorePasswordAttentionTitle,
  restorePasswordAttentionSubtitle,
  restorePasswordReset,
  restorePasswordForgot,
  ledgerAgreementText,
  ledgerAgreementTitle,
  ledgerAgreementAgree,
  ledgerFinishTitle,
  ledgerConnect,
  ledgerChooseAccount,
  ledgerVerify,
  ledgerStoreWalletSaving,
  ledgerVerifyAddress,
  ledgerAccountsAdd,
  ledgerAccountsAdded,
  ledgerAccountsWaiting,
  ledgerAccountsConfirm,
  ledgerFinishCongratulations,
  ledgerScanTitle,
  ledgerScanDescription1,
  ledgerScanDescription2,
  ledgerScanDescription3,
  ledgerScanDescription4,
  ledgerScanDescription5,
  ledgerScanDescription6,
  transactionContactEditHeaderTitle,
  transactionAddressPlaceholder,
  transactionAddressError,
  transactionAddressLabel,
  transactionSumSendTitle,
  transactionSumAddressTitle,
  transactionAccountSendFundsTitle,
  transactionLedgerConfirmationTitle,
  transactionConfirmationPreviewTitle,
  transactionsEmpty,
  trackActivityTitle,
  trackActivityImprovement,
  trackActivityImprovementDescription,
  trackActivityPrivacy,
  trackActivityPrivacyDescription,
  transactionLedgerBluetoothDisabled,
  transactionLedgerBluetoothConfirmation,
  termsOfService,
  termsPrivacyPolicy,
  termsAgreementFirst,
  termsAgreementSecond,
  signUpTitle,
  signInTitle,
  transactionSumSend,
  transactionSumPreview,
  copy,
  yes,
  no,
  name,
  address,
  accept,
  cancel,
  save,
  share,
  edit,
  continue,
  modalQRTitle,
  modalQRNoAccessTitle,
  modalQRNoAccessDescription,
  modalQRSendFunds,
  modalDetailsQRWarning,
  modalDetailsQRReceive,
  homeSettingsAbout,
  homeSettingsAccounts,
  homeSettingsAddressBook,
  homeSettingsAppearance,
  homeSettingsSecurity,
  homeSettingsProviders,
  homeSettingsFAQ,
  homeSettingsTest,
  homeSettingsLanguage,
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
  homeGovernanceTagAll,
  homeGovernanceTagVoting,
  homeGovernanceTagPassed,
  homeGovernanceTagRejected,
  homeGovernanceVotingCardVoting,
  homeGovernanceVotingCardDepositPeriod,
  homeGovernanceVotingCardYouVoted,
  homeGovernanceVotingCardYouDeposited,
  homeGovernanceVotingCardVotingEnd,
  homeGovernanceVotingCardVotingStart,
  homeGovernanceVotingCardDay,
  homeGovernanceVotingCardHour,
  homeGovernanceVotingCardMin,
  homeGovernanceVotingCardPassed,
  homeGovernanceVotingCardRejected,
  modalPinTitle,
  modalPinForgotCode,
  notificationCopied,
  notificationAccountDeleted,
  notificationAccountHidden,
  notificationPinChanged,
  onboardingRepeatPinInvalidCode,
  onboardingRepeatPinRepeat,
  onboardingRepeatPinSecurity,
  onboardingSetupPinProjectWallet,
  onboardingSetupPinSet,
  onboardingBiometryEnable,
  onboardingBiometrySafeFast,
  onboardingBiometrySkip,
  pinManyAttempts,
  settingsAccountEditHeaderTitle,
  settingsContactEditHeaderTitle,
  settingsContactEditNamePlaceholder,
  settingsContactEditDeleteContact,
  settingsProvidersTitle,
  settingsProvidersTitleRight,
  settingsProviderEditHeaderTitle,
  settingsProviderEditName,
  settingsProviderEditNamePlaceholder,
  settingsProviderEditNameHint,
  settingsProviderEditEthEndpoint,
  settingsProviderEditEthEndpointPlaceholder,
  settingsProviderEditEthEndpointHint,
  settingsProviderEditExplorer,
  settingsProviderEditExplorerPlaceholder,
  settingsProviderEditExplorerHint,
  settingsProviderEditCosmosEndpoint,
  settingsProviderEditCosmosEndpointPlaceholder,
  settingsProviderEditCosmosEndpointHint,
  settingsProviderEditCosmosChainId,
  settingsProviderEditCosmosChainIdPlaceholder,
  settingsProviderEditCosmosChainIdHint,
  settingsProviderEditDeleteProvider,
  settingsProviderEditUseProvider,
  settingsSecurityPinConfirm,
  settingsSecurityPinEnter,
  settingsSecurityPinNotMatched,
  settingsSecurityPinRepeat,
  settingsSecurityPinSet,
  settingsSecurityBiometry,
  SettingsSecurityChangePin,
  setttingsSecurityEnterPin,
  settingsSecurityWalletPin,
  settingsTestDelegate,
  settingsTestReward,
  settingsTestStaked,
  settingsTestUnbounded,
  settingsTestUndelegate,
  settingsAddressBookTitle,
  settingsAddressBookPlaceholder,
  settingsAddressBookAdd,
  settingsAddressBookAlertBtnSecond,
  settingsAddressBookAlertBtnFirst,
  settingsAddressBookAlertDesc,
  settingsAddressBookAlertTitle,
  sent,
  signinRestoreWalletPasteClipboard,
  signinRestoreWalletPhraseOrKey,
  signinRestoreWalletRecovery,
  signinRestoreWalletTextFieldError,
  signinRestoreWalletTextFieldLabel,
  signinRestoreWalletTextFieldPlaceholder,
  settingsAddressBookLabel,
  transactionSendTitle,
  signupStoreWalletCreatingAccount,
  signupStoreWalletAccountNumber,
  signinStoreWalletText,
  signinStoreWalletAccountNumber,
  settingsContactEditDelete,
  settingsContactEditSure,
  settingsAccountDetailHeaderTitle,
  settingsAccountDetailChangeStyleTitle,
  settingsAccountDetailChangeStyleSubtitle,
  settingsAccountDetailHideSubtitle,
  settingsAccountDetailHideTitle,
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
  voteAbstain,
  voteVeto,
  stakingDelegateFormTitle,
  stakingDelegateFormStakeTo,
  stakingDelegateFormCommission,
  stakingDelegateFormPreview,
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
  stakingUnDelegateFormPreview,
  stakingUnDelegateFormCommission,
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
  sumAmountNotEnough,
  sumAmountTooLow,
  settingsAboutTitle,
  settingsAboutVisit,
  settingsAboutDocuments,
  settingsAboutTerms,
  settingsAboutSocials,
  settingsAboutDiscord,
  settingsAboutTwitter,
  settingsAboutRights,
  to,
  settingsAccountRemoveTitle,
  settingsAccountRemoveMessage,
  settingsAccountRemoveConfirm,
  settingsAccountRemoveReject,
  popupNotificationTitle,
  popupNotificationDescription,
  popupNotificationTurnOn,
  popupNotificationNotNow,
  popupProposalVoteTitle,
  popupProposalVoteDescription,
  proposalVoteResults,
  proposalYouVoted,
  proposalAccountTitle,
  proposalDepositFinishDone,
  proposalDepositFinishTotalAmount,
  proposalDepositFormTitle,
  proposalDepositPreviewTitle,
  proposalDepositDepositFrom,
  proposalDepositTitle,
  proposalDepositTotalAmount,
  settingsAccountDetailRenameTitle,
  settingsAccountDetailRenameSubtitle,
  settingsAccountNoWallet,
  backupFinishCongratulation,
  backupFinishSuccess,
  backupFinishFinish,
  transactions,
  transactionSendTo,
  transactionDetailTotalAmount,
  transactionDetailViewOnBlock,
  transactionDetailSent,
  transactionDetailRecive,
  transactionDetailSentTo,
  transactionDetailReciveFrom,
  transactionDetailDate,
  transactionDetailNetwork,
  transactionDetailAmount,
  transactionDetailNetworkFee,
  transactionDetailCryptocurrency,
  transactionConfirmationSend,
  transactionConfirmationestimateFee,
  transactionConfirmationAmount,
  transactionConfirmationHAQQ,
  transactionConfirmationHQ,
  transactionConfirmationIslamicCoin,
  transactionConfirmationISLM,
  transactionConfirmationSendTo,
  transactionConfirmationTotalAmount,
  transactionConfirmationSum,
  transactionFinishSendingComplete,
  transactionFinishEditContact,
  transactionFinishAddContact,
  transactionFinishHash,
  transactionFinishDone,
  transactionFinishContactAdded,
  transactionFinishContactUpdated,
  transactionFinishContactMessage,
  transactionFinishContactMessagePlaceholder,
  proposalTitle,
  proposalInfo,
  proposalDescription,
  proposalType,
  proposalTotalDeposit,
  proposalDate,
  proposalCreatedAt,
  proposalVoteStart,
  proposalDepositEnd,
  proposalVoteEnd,
  proposalChanges,
  proposalDepositAttention,
  proposalDeposit,
  proposalNotEnough,
  proposalNotEnoughDescription,
  proposalNoVoting,
  onboardingFinishCreate,
  onboardingFinishRecover,
  walletCreateAddAccount,
  walletCreateImportAndCreate,
  walletCreateNew,
  walletCreateConnect,
  walletCreateImport,
  walletCardSend,
  walletCardWithoutBackup,
  settingsAccountStyleChoseColor,
  settingsAccountStyleGenerate,
  settingsAccountStyleUseStyle,
  settingsAccountStyleAlreadyUsed,
  settingsAccountStyleFlat,
  settingsAccountStyleGradient,
  settingsAccountStyleCircle,
  settingsAccountStyleRhombus,
  settingsThemeScreen,
  settingsThemeLight,
  settingsThemeDark,
  settingsThemeSystem,
  validatorStatusActive,
  validatorStatusInactive,
  validatorStatusJailed,
  validatorInfoReward,
  validatorInfoStaked,
  validatorInfoUndelegateInProcess,
  validatorInfoShowOther,
  validatorInfoHide,
  notificationRewardReceived,
  welcomeTitle,
  welcomeDescription,
  welcomeCreateWallet,
  welcomeLedgerWallet,
  welcomeRestoreWallet,
  restoreWalletScreenTitle,
  noInternetPopupTitle,
  noInternetPopupDescription,
  errorAccountAddedTitle,
  errorAccountAddedClose,
  errorCreateAccountPopupTitle,
  errorCreateAccountPopupDescription,
  errorCreateAccountPopupClose,
  networkFee,
  qrModalSendFunds,
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
  [I18N.empty]: '',
  [I18N.numericKeyboard0]: '0',
  [I18N.numericKeyboard1]: '1',
  [I18N.numericKeyboard2]: '2',
  [I18N.numericKeyboard3]: '3',
  [I18N.numericKeyboard4]: '4',
  [I18N.numericKeyboard5]: '5',
  [I18N.numericKeyboard6]: '6',
  [I18N.numericKeyboard7]: '7',
  [I18N.numericKeyboard8]: '8',
  [I18N.numericKeyboard9]: '9',
  [I18N.backupCreateRecoveryPhrase]: 'Your recovery phrase',
  [I18N.backupCreateRecoverySaveWords]:
    'Write down or copy these words in the right order and save them somewhere safe.',
  [I18N.backupCreateRecoveryWarningMessage]:
    'If you lose your recovery phrase, you will be unable to access your funds, as nobody will be able to restore it.',
  [I18N.backupCreateRecoveryAgreement]:
    'I understand that if I lose my recovery phrase, I will not be able to restore access to my account',
  [I18N.backupCreateScreenshotWarningTitle]: 'Warning!',
  [I18N.backupCreateScreenshotWarningSubtitle]:
    'Taking a screenshot of your recovery phrase increases security risks of your account.',
  [I18N.backupCreateVerifyTitle]: 'Recovery phrase',
  [I18N.backupWarningButton]: 'Understood',
  [I18N.backupWarningInfoBlock1]:
    'If you lose your recovery phrase, you will be unable to access your funds, as nobody will be able to restore it.',
  [I18N.backupWarningInfoBlock2]:
    'This phrase is your only chance to recover access to your funds if your device is unavailable to you.',
  [I18N.backupWarningTitle]: 'Important Recovery Info',
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
  [I18N.termsAgreementFirst]: 'By clicking Agree you agree to ',
  [I18N.termsOfService]: 'Terms of Service',
  [I18N.termsAgreementSecond]: ' and ',
  [I18N.termsPrivacyPolicy]: 'Privacy Policy',
  // 'By clicking Agree you agree to the Terms of Service and',
  [I18N.restoreAgreementTitle]:
    'Do you have your recovery phrase or private key?',
  [I18N.restoreAgreementText]:
    'The recovery phrase is a 12-word phrase that you received when you created the account. A private key is a key created by you in the application',
  [I18N.restoreAgreementAgree]: 'Agree',
  [I18N.restorePasswordAttentionTitle]:
    'Attention. You may lose all your funds!',
  [I18N.restorePasswordAttentionSubtitle]:
    'Do not reset the application if you are not sure that you can restore your account. To restore, you will need a recovery phrase of 12 words that you have created for your account',
  [I18N.restorePasswordReset]: 'Reset',
  [I18N.restorePasswordForgot]: 'Forgot your password?',
  [I18N.ledgerAgreementTitle]: 'Connect your Ledger',
  [I18N.ledgerAgreementText]:
    'If you have a Ledger Nano X, then you can connect it via Bluetooth to Islm Wallet. You will be able to manage funds from Ledger using Islm Wallet',
  [I18N.ledgerAgreementAgree]: 'Connect',
  [I18N.ledgerAccountsAdd]: 'Add',
  [I18N.ledgerAccountsAdded]: 'Added',
  [I18N.ledgerAccountsWaiting]: 'Waiting for confirmation of pairing',
  [I18N.ledgerAccountsConfirm]: 'Confirm pairing on your Ledger',
  [I18N.ledgerFinishCongratulations]:
    'Сongratulations!You have successfully added a new account',
  [I18N.ledgerScanTitle]: 'Looking for devices',
  [I18N.ledgerScanDescription1]: 'Please make sure your Ledger Nano X is ',
  [I18N.ledgerScanDescription2]: 'unlocked',
  [I18N.ledgerScanDescription3]: 'Bluetooth is enabled',
  [I18N.ledgerScanDescription4]: ' and ',
  [I18N.ledgerScanDescription5]: 'Ethereum app on your Ledger is installed',
  [I18N.ledgerScanDescription6]: ' and opened',
  [I18N.backupVerifyTitle]: 'Verify recovery phrase',
  [I18N.backupVerifyError]: 'Ooops, mistake in one of the words',
  [I18N.backupVerifyDescription]:
    'Please choose the correct  according to the serial number',
  [I18N.backupVerifyCheck]: 'Check',
  [I18N.modalQRTitle]: 'Scan QR Code',
  [I18N.modalQRNoAccessTitle]: 'No access to the camera',
  [I18N.modalQRNoAccessDescription]:
    'The app does not have access to your camera. Please go to your phone settings and allow the app to use camera. Without this, we will not be able to scan QR Code',
  [I18N.modalQRSendFunds]: 'Send funds from',
  [I18N.modalDetailsQRWarning]:
    'Only ISLM related assets on HAQQ network are supported.',
  [I18N.onboardingFinishCreate]:
    'Congratulations!\nYou have successfully added a new account',
  [I18N.onboardingFinishRecover]:
    'Congratulations!\nYou have successfully recovered an account',
  [I18N.onboardingRepeatPinInvalidCode]: 'Invalid code. Try again',
  [I18N.onboardingRepeatPinRepeat]: 'Please repeat pin code',
  [I18N.onboardingRepeatPinSecurity]:
    "For security, we don't have a “Restore pin” button.",
  [I18N.modalDetailsQRReceive]: 'Receive',
  [I18N.transactionContactEditHeaderTitle]: 'Edit Contact',
  [I18N.transactionSumSendTitle]: 'Send',
  [I18N.transactionSumAddressTitle]: 'Address',
  [I18N.transactionAccountSendFundsTitle]: 'Send funds from',
  [I18N.transactionLedgerConfirmationTitle]: 'Confirmation',
  [I18N.transactionConfirmationPreviewTitle]: 'Preview',
  [I18N.transactionAddressPlaceholder]: 'Address (0x) or contact name',
  [I18N.transactionAddressError]: 'Incorrect address',
  [I18N.transactionAddressLabel]: 'Send to',
  [I18N.transactionsEmpty]: 'No transactions',
  [I18N.trackActivityTitle]: 'Allow ISLM Wallet track your activity',
  [I18N.trackActivityImprovement]: 'Improvement',
  [I18N.trackActivityImprovementDescription]:
    'This will help us to collect more information about the problems of the application',
  [I18N.trackActivityPrivacy]: 'Security and privacy',
  [I18N.trackActivityPrivacyDescription]:
    'We securely store the data we receive. All data is non-personalized',
  [I18N.signInTitle]: 'Recover your account',
  [I18N.settingsAccountEditHeaderTitle]: 'Edit account name',
  [I18N.settingsContactEditHeaderTitle]: 'Contact',
  [I18N.settingsContactEditDeleteContact]: 'Delete Contact',
  [I18N.settingsContactEditNamePlaceholder]: 'Enter a name',
  [I18N.signUpTitle]: 'Create a wallet',
  [I18N.copy]: 'Copy',
  [I18N.yes]: 'Yes',
  [I18N.no]: 'No',
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
  [I18N.onboardingSetupPinProjectWallet]:
    'Protect your wallet. PIN code increases wallet security in the event your phone is stolen',
  [I18N.onboardingSetupPinSet]: 'Set 6-digit pin code',
  [I18N.onboardingBiometryEnable]: 'Enable {{biometry}}',
  [I18N.onboardingBiometrySafeFast]: 'Safe and fast',
  [I18N.onboardingBiometrySkip]: 'Skip',
  [I18N.notificationRewardReceived]: 'The reward is received',
  [I18N.modalPinForgotCode]: 'Forgot\nthe code',
  [I18N.pinManyAttempts]: 'Too many attempts, please wait for {{attempts}}',
  [I18N.homeWallet]: 'Accounts',
  [I18N.homeWalletTitle]: 'Your accounts',
  [I18N.homeSettings]: 'Settings',
  [I18N.homeSettingsTitle]: 'Settings',
  [I18N.homeStaking]: 'Staking',
  [I18N.ledgerConnect]: 'Connect ledger',
  [I18N.ledgerChooseAccount]: 'Choose account',
  [I18N.ledgerVerify]: 'Verify',
  [I18N.homeStakingEmpty]:
    'Stake your ISLM in any validator and get additional ISLM',
  [I18N.homeStakingUnbounded]: 'Unbounded',
  [I18N.homeStakingTitle]: 'Staking',
  [I18N.homeGovernance]: 'Governance',
  [I18N.homeGovernanceTitle]: 'Governance',
  [I18N.homeGovernanceTagAll]: 'All',
  [I18N.homeGovernanceTagVoting]: 'Voting',
  [I18N.homeGovernanceTagPassed]: 'Passed',
  [I18N.homeGovernanceTagRejected]: 'Rejected',
  [I18N.homeGovernanceVotingCardVoting]: 'Voting',
  [I18N.homeGovernanceVotingCardDepositPeriod]: 'Deposit',
  [I18N.homeGovernanceVotingCardYouVoted]: 'You voted',
  [I18N.homeGovernanceVotingCardYouDeposited]: 'You deposited',
  [I18N.homeGovernanceVotingCardVotingEnd]: 'Voting end',
  [I18N.homeGovernanceVotingCardVotingStart]: 'Voting start',
  [I18N.homeGovernanceVotingCardDay]: 'Day',
  [I18N.homeGovernanceVotingCardHour]: 'Hour',
  [I18N.homeGovernanceVotingCardMin]: 'Min',
  [I18N.homeGovernanceVotingCardPassed]: 'Passed',
  [I18N.homeGovernanceVotingCardRejected]: 'Rejected',
  [I18N.homeStakingStaked]: 'Staked',
  [I18N.homeStakingRewards]: 'Rewards',
  [I18N.settingsProvidersTitle]: 'Providers',
  [I18N.settingsProvidersTitleRight]: 'Add',
  [I18N.settingsProviderEditHeaderTitle]: 'Provider',
  [I18N.settingsProviderEditName]: 'Name',
  [I18N.settingsProviderEditNamePlaceholder]: 'Provider name',
  [I18N.settingsProviderEditNameHint]:
    'You can enter any name that suits you. \nExample: Haqq Network',
  [I18N.settingsProviderEditEthEndpoint]: 'EVM RPC',
  [I18N.settingsProviderEditEthEndpointPlaceholder]: 'URL',
  [I18N.settingsProviderEditEthEndpointHint]:
    'JSON-RPC endpoint to interact with the EVM\nExample: https://rpc.eth.haqq.network/',
  [I18N.settingsProviderEditExplorer]: 'EVM Explorer',
  [I18N.settingsProviderEditExplorerPlaceholder]: 'URL',
  [I18N.settingsProviderEditExplorerHint]:
    'Explorer url for check transactions\nExample: https://explorer.haqq.network/',
  [I18N.settingsProviderEditCosmosEndpoint]: 'Cosmos RPC',
  [I18N.settingsProviderEditCosmosEndpointPlaceholder]: 'URL',
  [I18N.settingsProviderEditCosmosEndpointHint]:
    'REST endpoint for interact with cosmos native modules\nExample: https://rpc.cosmos.haqq.network/',
  [I18N.settingsProviderEditCosmosChainId]: 'Chain ID',
  [I18N.settingsProviderEditCosmosChainIdPlaceholder]:
    '{identifier}_{EIP155}-{version}',
  [I18N.settingsProviderEditCosmosChainIdHint]: 'Example: haqq_11235-1',
  [I18N.settingsProviderEditDeleteProvider]: 'Delete Provider',
  [I18N.settingsTestDelegate]: 'Delegate',
  [I18N.settingsTestReward]: 'Reward: {{reward}}',
  [I18N.settingsTestStaked]: 'Staked: {{staked}}',
  [I18N.settingsTestUnbounded]: 'Unbounded: {{unbounded}}',
  [I18N.settingsTestUndelegate]: 'Undelegate',
  [I18N.settingsProviderEditUseProvider]: 'Use this provider',
  [I18N.signupStoreWalletCreatingAccount]: 'Creating your account',
  [I18N.signupStoreWalletAccountNumber]: 'Account #{{number}}',
  [I18N.signinRestoreWalletPasteClipboard]: 'Paste from Clipboard',
  [I18N.signinRestoreWalletPhraseOrKey]: 'Recovery phrase or Private key',
  [I18N.signinRestoreWalletRecovery]: 'Recovery',
  [I18N.signinRestoreWalletTextFieldError]: 'Incorrect address',
  [I18N.signinRestoreWalletTextFieldLabel]: 'Backup phrase',
  [I18N.signinRestoreWalletTextFieldPlaceholder]:
    'Enter or paste your recovery phrase',
  [I18N.signinStoreWalletText]: 'Account recovery in progress',
  [I18N.signinStoreWalletAccountNumber]: 'Account #{{number}}',
  [I18N.settingsAccountRemoveTitle]:
    'Attention. You may lose all your funds! Are you sure you want to delete your account?',
  [I18N.settingsAccountRemoveMessage]:
    'Do not delete the account if you are not sure that you can restore them. To restore, you will need a  of 12 words that you made for your account',
  [I18N.settingsAccountRemoveConfirm]: 'Delete',
  [I18N.settingsAccountRemoveReject]: 'Cancel',
  [I18N.settingsAccountDetailHeaderTitle]: 'Account details',
  [I18N.settingsAccountDetailRenameTitle]: 'Rename account',
  [I18N.settingsAccountDetailRenameSubtitle]: 'Change the account display name',
  [I18N.settingsAccountDetailChangeStyleTitle]: 'Change style',
  [I18N.settingsAccountDetailChangeStyleSubtitle]:
    'Change the picture of the account',
  [I18N.settingsAccountDetailHideSubtitle]:
    'Will be hidden from the general list',
  [I18N.settingsAccountDetailHideTitle]: 'Hide account',
  [I18N.settingsContactEditDelete]: 'Delete',
  [I18N.settingsContactEditSure]:
    'Are you sure you want to delete the selected contact?',
  [I18N.settingsAddressBookLabel]: 'Address',
  [I18N.settingsAddressBookPlaceholder]: 'Search or add a contact',
  [I18N.settingsAddressBookTitle]: 'My contacts',
  [I18N.settingsAddressBookAdd]: 'Add Contact',
  [I18N.settingsAddressBookAlertTitle]: 'Delete Contact',
  [I18N.settingsAddressBookAlertDesc]:
    'Are you sure you want to delete the selected contact?',
  [I18N.settingsAddressBookAlertBtnFirst]: 'Cancel',
  [I18N.settingsAddressBookAlertBtnSecond]: 'Delete',
  [I18N.settingsSecurityPinConfirm]: 'Confirm',
  [I18N.settingsSecurityPinEnter]: 'Enter',
  [I18N.settingsSecurityPinNotMatched]: 'Pin not matched',
  [I18N.settingsSecurityPinRepeat]: 'Please repeat pin code',
  [I18N.settingsSecurityPinSet]: 'Set 6-digital pin code',
  [I18N.settingsSecurityBiometry]: 'Use {{biometry}} to unlock the app',
  [I18N.SettingsSecurityChangePin]: 'Change PIN',
  [I18N.setttingsSecurityEnterPin]: 'Enter new PIN',
  [I18N.settingsSecurityWalletPin]: 'Enter ISLM Wallet PIN',
  [I18N.sent]: 'Sent',
  [I18N.transactionSendTitle]: 'Sent',
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
  [I18N.voteAbstain]: 'Abstain',
  [I18N.voteVeto]: 'Veto',
  [I18N.stakingDelegateFormTitle]: 'Delegate',
  [I18N.stakingDelegateFormStakeTo]: 'Stake to',
  [I18N.stakingDelegateFormCommission]: 'Commission',
  [I18N.stakingDelegateFormPreview]: 'Preview',
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
  [I18N.stakingUnDelegateFormCommission]: 'Commission',
  [I18N.stakingUnDelegateFormPreview]: 'Preview',
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
  [I18N.sumAmountNotEnough]: "You don't have enough ISLM to pay the fee",
  [I18N.sumAmountTooLow]: 'Should be greater than 0.0001',
  [I18N.popupNotificationTitle]: 'Turn on push notifications',
  [I18N.popupNotificationDescription]:
    'We can notify you when something important happens, such as: The transaction was successfully sent. Funds have arrived in the wallet. We detect any risks for the security of your account',
  [I18N.popupNotificationTurnOn]: 'Turn on notifications',
  [I18N.popupNotificationNotNow]: 'Not now',
  [I18N.popupProposalVoteTitle]: 'Choose what to vote for',
  [I18N.popupProposalVoteDescription]:
    'You can change your vote while the voting is in progress',
  [I18N.proposalVoteResults]: 'Vote results',
  [I18N.proposalYouVoted]: 'You voted',
  [I18N.proposalAccountTitle]: 'Vote from',
  [I18N.proposalDepositFinishDone]: 'Done',
  [I18N.proposalDepositFinishTotalAmount]: 'Total Amount',
  [I18N.proposalDepositFormTitle]: 'Deposit',
  [I18N.proposalDepositPreviewTitle]: 'Preview',
  [I18N.proposalDepositDepositFrom]: 'Deposit from',
  [I18N.proposalDepositTitle]: 'Deposit Completed',
  [I18N.proposalDepositTotalAmount]: 'Total Amount',
  [I18N.welcomeTitle]: 'No account is connected',
  [I18N.welcomeDescription]:
    'You can create a new account or connect any existing\u00A0one',
  [I18N.welcomeCreateWallet]: 'Create Account',
  [I18N.welcomeLedgerWallet]: 'Connect',
  [I18N.settingsAboutTitle]: 'About App',
  [I18N.settingsAboutVisit]: 'Visit islamiccoin.net',
  [I18N.settingsAboutDocuments]: 'Legal Documents',
  [I18N.settingsAboutTerms]: 'Terms & Conditions',
  [I18N.settingsAboutSocials]: 'Our Socials',
  [I18N.settingsAboutDiscord]: 'Discord',
  [I18N.settingsAboutTwitter]: 'Twitter',
  [I18N.settingsAboutRights]: `Version ${getAppVersion()} (${getBuildNumber()})`,
  [I18N.welcomeRestoreWallet]: 'I already have an account',
  [I18N.backupFinishCongratulation]: 'Congratulations!',
  [I18N.settingsAccountStyleChoseColor]: 'Choose color style',
  [I18N.settingsAccountStyleGenerate]: 'Generate',
  [I18N.settingsAccountStyleUseStyle]: 'Use this style',
  [I18N.settingsAccountStyleAlreadyUsed]: 'This style is used',
  [I18N.settingsAccountStyleFlat]: 'Flat',
  [I18N.settingsAccountStyleGradient]: 'Gradient',
  [I18N.settingsAccountStyleCircle]: 'Circle',
  [I18N.settingsAccountStyleRhombus]: 'Rhombus',
  [I18N.backupFinishSuccess]: "You've successfully protected your account.",
  [I18N.backupFinishFinish]: 'Proceed',
  [I18N.proposalTitle]: 'Proposal',
  [I18N.transactionSumSend]: 'Send to',
  [I18N.transactionSumPreview]: 'Preview',
  [I18N.transactions]: 'Transactions',
  [I18N.to]: 'to {{address}}',
  [I18N.transactionSendTo]: 'to {{address}}',
  [I18N.transactionConfirmationSend]: 'Send',
  [I18N.transactionConfirmationestimateFee]: '{{estimateFee}} aISLM',
  [I18N.transactionConfirmationAmount]: '{{amount}} ISLM',
  [I18N.transactionConfirmationHAQQ]: 'HAQQ blockchain',
  [I18N.transactionConfirmationHQ]: '(HQ)',
  [I18N.transactionConfirmationIslamicCoin]: 'Islamic coin',
  [I18N.transactionConfirmationISLM]: '(ISLM)',
  [I18N.transactionConfirmationSendTo]: 'Send to',
  [I18N.transactionConfirmationTotalAmount]: 'Total Amount',
  [I18N.transactionConfirmationSum]: '{{sum}} ISLM',
  [I18N.transactionFinishSendingComplete]: 'Transaction Completed!',
  [I18N.transactionFinishEditContact]: 'Edit Contact',
  [I18N.transactionFinishAddContact]: 'Add Contact',
  [I18N.transactionFinishHash]: 'Hash',
  [I18N.transactionFinishDone]: 'Done',
  [I18N.transactionFinishContactAdded]: 'Contact added',
  [I18N.transactionFinishContactUpdated]: 'Contact updated',
  [I18N.transactionFinishContactMessage]: 'Address:\n{{address}}',
  [I18N.transactionFinishContactMessagePlaceholder]: 'Contact name',
  [I18N.settingsAccountNoWallet]: 'No wallets',
  [I18N.proposalInfo]: 'Info',
  [I18N.proposalDescription]: 'Description',
  [I18N.proposalType]: 'Type',
  [I18N.proposalTotalDeposit]: 'Total deposit',
  [I18N.proposalDate]: 'Date',
  [I18N.proposalCreatedAt]: 'Created at (GMT)',
  [I18N.proposalVoteStart]: 'Vote start (GMT)',
  [I18N.proposalDepositEnd]: 'Deposit end (GMT)',
  [I18N.proposalVoteEnd]: 'Vote end (GMT)',
  [I18N.proposalChanges]: 'Parameter changes',
  [I18N.proposalDepositAttention]:
    'If the proposal does not collect the required number of deposits in a certain time, it will reject',
  [I18N.proposalDeposit]: 'Deposit',
  [I18N.proposalNotEnough]: 'Current {{percent}}% (Minimum 51%). ',
  [I18N.proposalNotEnoughDescription]:
    'If the proposal does not get the required number of votes in a certain time, then it will reject',
  [I18N.proposalNoVoting]: 'No Voting proposal',

  [I18N.ledgerStoreWalletSaving]: 'Account saving in progress',
  [I18N.ledgerVerifyAddress]:
    'Verify address {{address}} on your Ledger Nano X by pressing both buttons together',
  [I18N.finishProceed]: 'Proceed',
  [I18N.ledgerFinishTitle]:
    'Congratulations!\nYou have successfully added a new account',
  [I18N.transactionDetailTotalAmount]: 'Total amount',
  [I18N.transactionDetailViewOnBlock]: 'View on block explorer',
  [I18N.transactionDetailSent]: 'Sent',
  [I18N.transactionDetailRecive]: 'Receive',
  [I18N.transactionDetailSentTo]: 'Send to',
  [I18N.transactionDetailReciveFrom]: 'Received from',
  [I18N.transactionDetailDate]: 'Date',
  [I18N.transactionDetailNetwork]: 'Network',
  [I18N.transactionDetailAmount]: 'Amount',
  [I18N.transactionDetailNetworkFee]: 'Network Fee',
  [I18N.transactionDetailCryptocurrency]: 'Cryptocurrency',
  [I18N.walletCreateAddAccount]: 'Add accounts',
  [I18N.walletCreateImportAndCreate]: 'Import and create new accounts',
  [I18N.walletCreateNew]: 'Create new',
  [I18N.walletCreateConnect]: 'Connect',
  [I18N.walletCreateImport]: 'Import',
  [I18N.walletCardSend]: 'Send',
  [I18N.walletCardWithoutBackup]: 'Without backup',
  [I18N.restoreWalletScreenTitle]: 'Recover your account',
  [I18N.noInternetPopupTitle]: 'No Internet',
  [I18N.noInternetPopupDescription]:
    'Make sure you are connected to Wi-Fi or a cellular network',
  [I18N.errorAccountAddedTitle]: 'This account has already been added',
  [I18N.errorAccountAddedClose]: 'Close',
  [I18N.errorCreateAccountPopupTitle]: 'Failed to create an account',
  [I18N.errorCreateAccountPopupDescription]: 'Please try again later',
  [I18N.errorCreateAccountPopupClose]: 'Close',
  [I18N.networkFee]: 'Network fee: {{fee}} {{currency}}',
  [I18N.qrModalSendFunds]: 'Send funds from',
};
