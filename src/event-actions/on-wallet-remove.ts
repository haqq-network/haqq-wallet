import {Events} from '@app/events';
import {captureException} from '@app/helpers';
import {Transaction} from '@app/models/transaction';
import {VariablesString} from '@app/models/variables-string';
import {Wallet} from '@app/models/wallet';
import {PushNotifications} from '@app/services/push-notifications';

export async function onWalletRemove(address: string) {
  try {
    const wallets = Wallet.addressList();

    const transactions = Transaction.getAll().snapshot();
    const transactionsTo = transactions.filtered(
      `to = '${address.toLowerCase()}'`,
    );

    const transactionsFrom = transactions.filtered(
      `from = '${address.toLowerCase()}'`,
    );

    for (const transaction of transactionsTo) {
      if (!wallets.includes(transaction.from)) {
        Transaction.remove(transaction.hash);
      }
    }
    for (const transaction of transactionsFrom) {
      if (!wallets.includes(transaction.to)) {
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
  } catch (e) {
    captureException(e, Events.onWalletRemove, {
      address: address,
    });
  }
}
