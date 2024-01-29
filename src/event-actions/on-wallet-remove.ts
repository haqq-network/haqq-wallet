import {app} from '@app/contexts';
import {Events} from '@app/events';
import {Transaction} from '@app/models/transaction';
import {VariableString} from '@app/models/variables-string';
import {Wallet} from '@app/models/wallet';
import {Web3BrowserSession} from '@app/models/web3-browser-session';
import {Backend} from '@app/services/backend';
import {WalletConnect} from '@app/services/wallet-connect';

import {onAppReset} from './on-app-reset';
import {onWalletReset} from './on-wallet-reset';

export async function onWalletRemove(address: string) {
  try {
    WalletConnect.instance.onWalletRemove(address);
    const wallets = Wallet.addressList();

    // last wallet removed
    if (wallets.length === 0) {
      app.onboarded = false;
      await onAppReset();
      await onWalletReset();
    }

    const transactions = Transaction.getAll();
    const transactionsTo = transactions.filter(
      tx => tx.to === address.toLowerCase(),
    );

    const transactionsFrom = transactions.filter(
      tx => tx.from === address.toLowerCase(),
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

    const subscription = VariableString.get('notificationToken');
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
