import {app} from '@app/contexts';
import {onDeepLink} from '@app/event-actions/on-deep-link';
import {onPushSubscriptionAdd} from '@app/event-actions/on-push-subscription-add';
import {onStakingSync} from '@app/event-actions/on-staking-sync';
import {onWalletCreate} from '@app/event-actions/on-wallet-create';
import {onWalletRemove} from '@app/event-actions/on-wallet-remove';
import {onWalletsBalanceCheck} from '@app/event-actions/on-wallets-balance-check';
import {Events} from '@app/events';
import {throttle} from '@app/utils';

app.on(Events.onWalletsBalanceCheck, onWalletsBalanceCheck);
app.on(Events.onDeepLink, onDeepLink);
app.on(Events.onWalletCreate, onWalletCreate);
app.on(Events.onWalletRemove, onWalletRemove);
app.on(Events.onPushSubscriptionAdd, onPushSubscriptionAdd);
app.on(Events.onStakingSync, throttle(onStakingSync, 1000));
