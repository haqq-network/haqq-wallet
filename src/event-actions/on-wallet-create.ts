import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderSSSReactNative} from '@haqq/provider-sss-react-native';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {captureException, getProviderInstanceForWallet} from '@app/helpers';
import {Wallet} from '@app/models/wallet';
import {EthNetwork} from '@app/services';
import {PushNotifications} from '@app/services/push-notifications';
import {WalletType} from '@app/types';

export async function onWalletCreate(wallet: Wallet) {
  try {
    let subscription = app.notificationToken;
    if (subscription) {
      await PushNotifications.instance.createNotificationSubscription(
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

      switch (wallet.type) {
        case WalletType.sss:
          const providerSss = (await getProviderInstanceForWallet(
            wallet,
          )) as ProviderSSSReactNative;
          mnemonicSaved = await providerSss.isShareSaved();
          break;
        case WalletType.mnemonic:
          const providerMnemonic = (await getProviderInstanceForWallet(
            wallet,
          )) as ProviderMnemonicReactNative;
          mnemonicSaved = await providerMnemonic.isMnemonicSaved();
          break;
        default:
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
