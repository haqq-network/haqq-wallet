import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {captureException, getProviderInstanceForWallet} from '@app/helpers';
import {Wallet} from '@app/models/wallet';
import {EthNetwork} from '@app/services';
import {pushNotifications} from '@app/services/push-notifications';
import {WalletType} from '@app/types';

export async function onWalletCreate(wallet: Wallet) {
  try {
    let subscription = app.notifications;
    if (subscription) {
      await pushNotifications.createNotificationSubscription(
        subscription,
        wallet.address,
      );

      wallet.update({subscription});
    }

    EthNetwork.getBalance(wallet.address).then(balance => {
      app.emit(Events.onWalletsBalance, {
        [wallet.address]: balance,
      });
    });

    app.emit(Events.onTransactionsLoad, wallet.address);

    if (!wallet.mnemonicSaved) {
      let mnemonicSaved: boolean;
      if (wallet.type === WalletType.mnemonic) {
        const provider = getProviderInstanceForWallet(
          wallet,
        ) as ProviderMnemonicReactNative;
        mnemonicSaved = await provider.isMnemonicSaved();
      } else {
        mnemonicSaved = true;
      }

      wallet.update({
        mnemonicSaved,
      });
    }
  } catch (e) {
    captureException(e, Events.onWalletCreate, {
      address: wallet.address,
    });
  }
}
