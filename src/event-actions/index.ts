import {app} from '@app/contexts';
import {onAddressBookCreate} from '@app/event-actions/on-address-book-create';
import {onAppLoggedIn} from '@app/event-actions/on-app-logged-in';
import {onAppMnemonicBackup} from '@app/event-actions/on-app-mnemonic-backup';
import {
  onAppProviderMpcBackup
} from '@app/event-actions/on-app-provider-mpc-backup';
import {onAppStarted} from '@app/event-actions/on-app-started';
import {onDeepLink} from '@app/event-actions/on-deep-link';
import {onDynamicLink} from '@app/event-actions/on-dynamic-link';
import {onPushNotification} from '@app/event-actions/on-push-notification';
import {
  onPushSubscriptionAdd
} from '@app/event-actions/on-push-subscription-add';
import {onStakingSync} from '@app/event-actions/on-staking-sync';
import {onTransactionCheck} from '@app/event-actions/on-transaction-check';
import {onTransactionCreate} from '@app/event-actions/on-transaction-create';
import {onTransactionsLoad} from '@app/event-actions/on-transactions-load';
import {
  onWalletConnectApproveConnection
} from '@app/event-actions/on-wallet-connect-approve-connection';
import {
  onWalletConnectSignTransaction
} from '@app/event-actions/on-wallet-connect-sign-transaction';
import {onWalletConnectUri} from '@app/event-actions/on-wallet-connect-uri';
import {onWalletCreate} from '@app/event-actions/on-wallet-create';
import {
  onWalletMnemonicCheck
} from '@app/event-actions/on-wallet-mnemonic-check';
import {
  onWalletMnemonicSaved
} from '@app/event-actions/on-wallet-mnemonic-saved';
import {onWalletMpcCheck} from '@app/event-actions/on-wallet-mpc-check';
import {onWalletMpcSaved} from '@app/event-actions/on-wallet-mpc-saved';
import {onWalletRemove} from '@app/event-actions/on-wallet-remove';
import {onWalletReset} from '@app/event-actions/on-wallet-reset';
import {
  onWalletsBalanceCheck
} from '@app/event-actions/on-wallets-balance-check';
import {Events} from '@app/events';
import {callbackWrapper, throttle} from '@app/utils';
import {onAddressBookSync} from '@app/event-actions/on-address-book-sync';

app.on(Events.onWalletsBalanceCheck, throttle(onWalletsBalanceCheck, 1000));
app.on(Events.onDeepLink, onDeepLink);
app.on(Events.onWalletCreate, onWalletCreate);
app.on(Events.onWalletRemove, onWalletRemove);
app.on(Events.onPushSubscriptionAdd, onPushSubscriptionAdd);
app.on(Events.onStakingSync, throttle(onStakingSync, 1000));
app.on(Events.onTransactionsLoad, callbackWrapper(onTransactionsLoad));
app.on(Events.onAppStarted, callbackWrapper(onAppStarted));
app.on(Events.onAppLoggedId, callbackWrapper(onAppLoggedIn));
app.on(Events.onAppMnemonicBackup, onAppMnemonicBackup);
app.on(Events.onWalletReset, onWalletReset);
app.on(Events.onWalletMnemonicCheck, onWalletMnemonicCheck);
app.on(Events.onWalletMnemonicSaved, onWalletMnemonicSaved);
app.on(Events.onWalletMpcCheck, onWalletMpcCheck);
app.on(Events.onWalletMpcSaved, onWalletMpcSaved);
app.on(Events.onWalletConnectUri, onWalletConnectUri);
app.on(
  Events.onWalletConnectApproveConnection,
  onWalletConnectApproveConnection,
);
app.on(Events.onAppProviderMpcBackup, onAppProviderMpcBackup);
app.on(Events.onWalletConnectSignTransaction, onWalletConnectSignTransaction);
app.on(Events.onDynamicLink, onDynamicLink);
app.on(Events.onTransactionCheck, onTransactionCheck);
app.on(Events.onPushNotification, onPushNotification);
app.on(Events.onTransactionCreated, onTransactionCreated);
app.on(Events.onAddressBookCreate, callbackWrapper(onAddressBookCreate));
app.on(Events.onTransactionCreate, callbackWrapper(onTransactionCreate));
app.on(Events.onAddressBookSync, callbackWrapper(onAddressBookSync));
