import {app} from '@app/contexts';
import {onAppMnemonicBackup} from '@app/event-actions/on-app-mnemonic-backup';
import {onAppStarted} from '@app/event-actions/on-app-started';
import {onDeepLink} from '@app/event-actions/on-deep-link';
import {onPushSubscriptionAdd} from '@app/event-actions/on-push-subscription-add';
import {onStakingSync} from '@app/event-actions/on-staking-sync';
import {onTransactionsLoad} from '@app/event-actions/on-transactions-load';
import {onWalletConnectApproveConnection} from '@app/event-actions/on-wallet-connect-approve-connection';
import {onWalletConnectUri} from '@app/event-actions/on-wallet-connect-uri';
import {onWalletCreate} from '@app/event-actions/on-wallet-create';
import {onWalletMnemonicCheck} from '@app/event-actions/on-wallet-mnemonic-check';
import {onWalletMnemonicSaved} from '@app/event-actions/on-wallet-mnemonic-saved';
import {onWalletRemove} from '@app/event-actions/on-wallet-remove';
import {onWalletReset} from '@app/event-actions/on-wallet-reset';
import {onWalletsBalanceCheck} from '@app/event-actions/on-wallets-balance-check';
import {Events} from '@app/events';
import {throttle} from '@app/utils';

import {onWalletConnectSignTransaction} from './on-wallet-connect-sign-transaction';

app.on(Events.onWalletsBalanceCheck, throttle(onWalletsBalanceCheck, 1000));
app.on(Events.onDeepLink, onDeepLink);
app.on(Events.onWalletCreate, onWalletCreate);
app.on(Events.onWalletRemove, onWalletRemove);
app.on(Events.onPushSubscriptionAdd, onPushSubscriptionAdd);
app.on(Events.onStakingSync, throttle(onStakingSync, 1000));
app.on(Events.onTransactionsLoad, onTransactionsLoad);
app.on(Events.onAppStarted, onAppStarted);
app.on(Events.onAppMnemonicBackup, onAppMnemonicBackup);
app.on(Events.onWalletReset, onWalletReset);
app.on(Events.onWalletMnemonicCheck, onWalletMnemonicCheck);
app.on(Events.onWalletMnemonicSaved, onWalletMnemonicSaved);
app.on(Events.onWalletConnectUri, onWalletConnectUri);
app.on(
  Events.onWalletConnectApproveConnection,
  onWalletConnectApproveConnection,
);
app.on(Events.onWalletConnectSignTransaction, onWalletConnectSignTransaction);
