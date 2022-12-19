import base64 from 'react-native-base64';

import {app} from '@app/contexts';
import {captureException} from '@app/helpers';
import {Wallet} from '@app/models/wallet';
import {navigator} from '@app/navigator';
import {Cosmos} from '@app/services/cosmos';
import {pushNotifications} from '@app/services/push-notifications';
import {throttle} from '@app/utils';

export enum Events {
  onWalletCreate = 'onWalletCreate',
  onWalletRemove = 'onWalletRemove',
  onPushSubscriptionAdd = 'onPushSubscriptionAdd',
  onPushSubscriptionRemove = 'onPushSubscriptionRemove',
  onDeepLink = 'onDeepLink',
  onStakingSync = 'onStakingSync',
}

app.on(Events.onDeepLink, async (link: string) => {
  console.log('onDeepLink');
  if (link && link.startsWith('haqq:')) {
    let params = link.split(':');

    if (params.length === 2) {
      navigator.navigate('transaction', {
        to: params[1],
      });
    } else if (params.length === 3) {
      switch (params[1]) {
        case 'provider':
          navigator.navigate('homeSettings', {
            screen: 'settingsProviderForm',
            params: {data: JSON.parse(base64.decode(params[2]))},
          });
          break;
      }
    }
  }
});

app.on(Events.onWalletCreate, async (wallet: Wallet) => {
  try {
    let subscription = app.notifications;
    if (subscription) {
      await pushNotifications.subscribeAddress(subscription, wallet.address);

      wallet.subscription = subscription;
    }
  } catch (e) {
    captureException(e, Events.onWalletCreate, {
      address: wallet.address,
    });
  }
});

app.on(Events.onWalletRemove, async (wallet: Wallet) => {
  try {
    if (wallet.subscription) {
      await pushNotifications.unsubscribeAddress(
        wallet.subscription,
        wallet.address,
      );
    }
  } catch (e) {
    captureException(e, Events.onWalletRemove, {
      address: wallet.address,
    });
  }
});

app.on(Events.onPushSubscriptionAdd, async () => {
  const user = app.getUser();

  if (!(user && user.subscription)) {
    return;
  }

  const wallets = Wallet.getAll();

  await Promise.all(
    wallets.map(async w => {
      await pushNotifications.subscribeAddress(user.subscription!, w.address);
      w.subscription = user.subscription;
    }),
  );
});

app.on(
  Events.onStakingSync,
  throttle(async () => {
    const wallets = Wallet.getAll();

    const cosmos = new Cosmos(app.provider!);
    const addressList = wallets
      .filtered('isHidden != true')
      .map(w => Cosmos.address(w.address));
    await cosmos.sync(addressList);
  }, 1000),
);
