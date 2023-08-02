import {Events} from '@app/events';
import {Transaction} from '@app/models/transaction';
import {VariablesString} from '@app/models/variables-string';
import {Wallet} from '@app/models/wallet';
import {Web3BrowserSession} from '@app/models/web3-browser-session';
import {Backend} from '@app/services/backend';

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
      await Backend.instance.unsubscribeByTokenAndAddress(
        subscription,
        address,
      );
    }

    const sessions = Web3BrowserSession.getBySelectedAccount(address);
    for (const session of sessions) {
      session.disconnect();
    }
  } catch (e) {
    Logger.captureException(e, Events.onWalletRemove, {
      address: address,
    });
  }
}
