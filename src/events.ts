export enum Events {
  onProviderChanged = 'onProviderChanged',
  onWalletsBalanceCheck = 'onWalletsBalanceCheck',
  onWalletsBalance = 'onWalletsBalance',
  onWalletCreate = 'onWalletCreate',
  onWalletReset = 'onWalletReset',
  onWalletRemove = 'onWalletRemove',
  onWalletMnemonicCheck = 'onWalletMnemonicCheck',
  onWalletMnemonicSaved = 'onWalletMnemonicSaved',
  onPushSubscriptionAdd = 'onPushSubscriptionAdd',
  onPushSubscriptionRemove = 'onPushSubscriptionRemove',
  onDeepLink = 'onDeepLink',
  onStakingSync = 'onStakingSync',
  onCloseModal = 'onCloseModal',
  onTransactionsLoad = 'onTransactionsLoad',
  onAppStarted = 'onAppStarted',
  onAppMnemonicBackup = 'onAppMnemonicBackup',
  onWalletConnectUri = 'onWalletConnectUri',
  onWalletConnectApproveConnection = 'onWalletConnectApproveConnection',
  onWalletConnectSignTransaction = 'onWalletConnectSignTransaction',
}

export enum WalletConnectEvents {
  onSessionsChange = 'onSessionsChange',
}
