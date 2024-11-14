import {AddressUtils} from '@app/helpers/address-utils';
import {VariablesBool} from '@app/models/variables-bool';
import {VariablesString} from '@app/models/variables-string';
import {Wallet} from '@app/models/wallet';
import {Backend} from '@app/services/backend';
import {PushNotificationTopicsEnum} from '@app/services/push-notifications';

export async function onPushSubscriptionTransactionsSubscribe() {
  VariablesBool.set(
    `notificationsTopic:${PushNotificationTopicsEnum.transactions}`,
    true,
  );

  const subscription = VariablesString.get('notificationToken');

  if (subscription) {
    const wallets = Wallet.getAll();

    await Promise.all(
      wallets.map(async w =>
        Backend.instance.createNotificationSubscription(
          subscription,
          AddressUtils.toHaqq(w.address),
        ),
      ),
    );
  }
}
