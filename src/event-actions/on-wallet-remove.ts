import {Events} from '@app/events';
import {captureException} from '@app/helpers';
import {realm} from '@app/models';
import {Transaction} from '@app/models/transaction';
import {VariablesString} from '@app/models/variables-string';
import {Wallet} from '@app/models/wallet';
import {PushNotifications} from '@app/services/push-notifications';

export async function onWalletRemove(
  address: string,
  snapshot: Wallet,
  callback?: () => void,
) {
  try {
    const wallets = realm.objects<Wallet>(Wallet.schema.name);
    const addressArr = wallets.map(item => item.address);
    const transactions = realm.objects<Transaction>(Transaction.schema.name);

    const transactionsTo = transactions.filtered(
      `to = '${address.toLowerCase()}'`,
    );
    const transactionsFrom = transactions.filtered(
      `from = '${address.toLowerCase()}'`,
    );

    for (const transaction of transactionsTo) {
      if (!addressArr.includes(transaction.from)) {
        Transaction.remove(transaction.hash);
      }
    }
    for (const transaction of transactionsFrom) {
      if (!addressArr.includes(transaction.to)) {
        Transaction.remove(transaction.hash);
      }
    }

    const subscription = VariablesString.get('notificationToken');

    if (subscription) {
      await PushNotifications.instance.unsubscribeByTokenAndAddress(
        subscription,
        address,
      );
    }

    if (callback) {
      callback();
    }
  } catch (e) {
    captureException(e, Events.onWalletRemove, {
      address: address,
    });
  }
}
