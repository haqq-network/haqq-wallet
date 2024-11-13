export enum Events {
  onWalletCreate = 'onWalletCreate',
  onWalletReset = 'onWalletReset',
  onWalletRemove = 'onWalletRemove',
  onWalletSssCheck = 'onWalletSssCheck',
  onWalletMnemonicCheck = 'onWalletMnemonicCheck',
  onWalletMnemonicSaved = 'onWalletMnemonicSaved',
  onDeepLink = 'onDeepLink',
  onStakingSync = 'onStakingSync',
  onCloseModal = 'onCloseModal',
  onTransactionStatusLoad = 'onTransactionStatusLoad',
  onAppActive = 'onAppActive',
  onAppInitialized = 'onAppInitialized',
  onAppStarted = 'onAppStarted',
  onAppLoggedId = 'onAppLoggedId',
  onAppMnemonicBackup = 'onAppMnemonicBackup',
  onAppProviderSssBackup = 'onAppProviderSssBackup',
  onWalletConnectUri = 'onWalletConnectUri',
  onWalletConnectApproveConnection = 'onWalletConnectApproveConnection',
  onWalletConnectSignTransaction = 'onWalletConnectSignTransaction',
  onWalletSssSaved = 'onWalletSssSaved',
  onDynamicLink = 'onDynamicLink',
  onPushNotification = 'onPushNotification',
  onRaffleTicket = 'onRaffleTicket',
  onNeedUpdate = 'onNeedUpdate',
  onAppReviewRequest = 'onAppReviewRequest',
  openInAppBrowserPageLoaded = 'openInAppBrowserPageLoaded',
  enterPinSuccess = 'enterPinSuccess',
  onOnboardedChanged = 'onOnboardedChanged',
  onVestingBalanceSync = 'onVestingBalanceSync',
  onStakingBalanceSync = 'onStakingBalanceSync',
  onWalletsVestingBalanceCheck = 'onWalletsVestingBalanceCheck',
  onWalletsStakingBalanceCheck = 'onWalletsStakingBalanceCheck',
  onThemeChanged = 'onThemeChanged',
  onBlockRequestCheck = 'onBlockRequestCheck',
  onRequestMarkup = 'onRequestMarkup',
  onTesterModeChanged = 'onTesterModeChanged',
  onAuthenticatedChanged = 'onAuthenticatedChanged',
  onPushTokenRefresh = 'onPushTokenRefresh',
  onLocaleChanged = 'onLocaleChanged',
}

export enum WalletConnectEvents {
  onSessionsChange = 'onSessionsChange',
}
