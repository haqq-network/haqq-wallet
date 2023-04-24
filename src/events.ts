export enum Events {
  onProviderChanged = 'onProviderChanged',
  onWalletsBalanceCheck = 'onWalletsBalanceCheck',
  onWalletsBalance = 'onWalletsBalance',
  onWalletCreate = 'onWalletCreate',
  onWalletReset = 'onWalletReset',
  onWalletRemove = 'onWalletRemove',
  onWalletMpcCheck = 'onWalletMpcCheck',
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
  onAppStarted = 'onAppStarted',
  onAppLoggedId = 'onAppLoggedId',
  onAppMnemonicBackup = 'onAppMnemonicBackup',
  onAppProviderMpcBackup = 'onAppProviderMpcBackup',
  onWalletConnectUri = 'onWalletConnectUri',
  onWalletConnectApproveConnection = 'onWalletConnectApproveConnection',
  onWalletConnectSignTransaction = 'onWalletConnectSignTransaction',
  onWalletMpcSaved = 'onWalletMpcSaved',
  onDynamicLink = 'onDynamicLink',
  onPushNotification = 'onPushNotification',
  onAddressBookCreate = 'onAddressBookCreate',
  onAddressBookSync = 'onAddressBookSync',
}

export enum WalletConnectEvents {
  onSessionsChange = 'onSessionsChange',
}
