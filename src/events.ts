export enum Events {
  onProviderChanged = 'onProviderChanged',
  onWalletsBalanceCheck = 'onWalletsBalanceCheck',
  onWalletCreate = 'onWalletCreate',
  onWalletReset = 'onWalletReset',
  onWalletRemove = 'onWalletRemove',
  onWalletSssCheck = 'onWalletSssCheck',
  onWalletMnemonicCheck = 'onWalletMnemonicCheck',
  onWalletMnemonicSaved = 'onWalletMnemonicSaved',
  onPushSubscriptionAdd = 'onPushSubscriptionAdd',
  onPushSubscriptionRemove = 'onPushSubscriptionRemove',
  onDeepLink = 'onDeepLink',
  onStakingSync = 'onStakingSync',
  onCloseModal = 'onCloseModal',
  onTransactionsLoad = 'onTransactionsLoad',
  onTransactionCheck = 'onTransactionCheck',
  onTransactionCreate = 'onTransactionCreate',
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
  onAddressBookCreate = 'onAddressBookCreate',
  onAddressBookSync = 'onAddressBookSync',
  onRaffleTicket = 'onRaffleTicket',
  openInAppBrowserPageLoaded = 'openInAppBrowserPageLoaded',
  enterPinSuccess = 'enterPinSuccess',
}

export enum WalletConnectEvents {
  onSessionsChange = 'onSessionsChange',
}
