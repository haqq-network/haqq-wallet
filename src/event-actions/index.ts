import {app} from '@app/contexts';
import {onAppActive} from '@app/event-actions/on-app-active';
import {onAppInitialized} from '@app/event-actions/on-app-initialized';
import {onAppLoggedIn} from '@app/event-actions/on-app-logged-in';
import {onAppMnemonicBackup} from '@app/event-actions/on-app-mnemonic-backup';
import {onAppProviderSssBackup} from '@app/event-actions/on-app-provider-sss-backup';
import {onAppReviewRequest} from '@app/event-actions/on-app-review-request';
import {onAppStarted} from '@app/event-actions/on-app-started';
import {onBlockRequestCheck} from '@app/event-actions/on-block-request-check';
import {onDeepLink} from '@app/event-actions/on-deep-link';
import {onDynamicLink} from '@app/event-actions/on-dynamic-link';
import {onNeedUpdate} from '@app/event-actions/on-need-update';
import {onPushNotification} from '@app/event-actions/on-push-notification';
import {onStakingSync} from '@app/event-actions/on-staking-sync';
import {onWalletConnectApproveConnection} from '@app/event-actions/on-wallet-connect-approve-connection';
import {onWalletConnectSignTransaction} from '@app/event-actions/on-wallet-connect-sign-transaction';
import {onWalletConnectUri} from '@app/event-actions/on-wallet-connect-uri';
import {onWalletCreate} from '@app/event-actions/on-wallet-create';
import {onWalletMnemonicCheck} from '@app/event-actions/on-wallet-mnemonic-check';
import {onWalletMnemonicSaved} from '@app/event-actions/on-wallet-mnemonic-saved';
import {onWalletRemove} from '@app/event-actions/on-wallet-remove';
import {onWalletSssCheck} from '@app/event-actions/on-wallet-sss-check';
import {onWalletSssSaved} from '@app/event-actions/on-wallet-sss-saved';
import {Events} from '@app/events';
import {throttle} from '@app/utils';

import {onPushTokenRefresh} from './on-push-token-refresh';

app.on(Events.onDeepLink, onDeepLink);
app.on(Events.onWalletCreate, onWalletCreate);
app.on(Events.onWalletRemove, onWalletRemove);
app.on(Events.onStakingSync, throttle(onStakingSync, 1000));
app.on(Events.onAppActive, onAppActive);
app.on(Events.onAppInitialized, onAppInitialized);
app.on(Events.onAppStarted, onAppStarted);
app.on(Events.onAppLoggedId, onAppLoggedIn);
app.on(Events.onAppMnemonicBackup, onAppMnemonicBackup);
app.on(Events.onWalletMnemonicCheck, onWalletMnemonicCheck);
app.on(Events.onWalletMnemonicSaved, onWalletMnemonicSaved);
app.on(Events.onWalletSssCheck, onWalletSssCheck);
app.on(Events.onWalletSssSaved, onWalletSssSaved);
app.on(Events.onWalletConnectUri, onWalletConnectUri);
app.on(
  Events.onWalletConnectApproveConnection,
  onWalletConnectApproveConnection,
);
app.on(Events.onAppProviderSssBackup, onAppProviderSssBackup);
app.on(Events.onWalletConnectSignTransaction, onWalletConnectSignTransaction);
app.on(Events.onDynamicLink, onDynamicLink);
app.on(Events.onPushNotification, onPushNotification);
app.on(Events.onAppReviewRequest, onAppReviewRequest);
app.on(Events.onNeedUpdate, onNeedUpdate);
app.on(Events.onBlockRequestCheck, onBlockRequestCheck);
app.on(Events.onPushTokenRefresh, onPushTokenRefresh);
