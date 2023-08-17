import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderSSSReactNative} from '@haqq/provider-sss-react-native';

import {app} from '@app/contexts';
import {onStakingSync} from '@app/event-actions/on-staking-sync';
import {onTransactionsLoad} from '@app/event-actions/on-transactions-load';
import {onVestingSync} from '@app/event-actions/on-vesting-sync';
import {Events} from '@app/events';
import {getProviderInstanceForWallet} from '@app/helpers';
import {Wallet} from '@app/models/wallet';
import {EthNetwork} from '@app/services';
import {Backend} from '@app/services/backend';
import {Cosmos} from '@app/services/cosmos';
import {WalletType} from '@app/types';

export async function onWalletCreate(wallet: Wallet) {
  try {
    let subscription = app.notificationToken;
    if (subscription) {
      await Backend.instance.createNotificationSubscription(
        subscription,
        Cosmos.addressToBech32(wallet.address),
      );

      wallet.update({subscription});
    }

    EthNetwork.getBalance(wallet.address).then(balance => {
      app.onWalletsBalance({
        [wallet.address]: balance,
      });
    });

    await Promise.all([
      onTransactionsLoad(wallet.address),
      onStakingSync(),
      onVestingSync(),
    ]);

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
    Logger.captureException(e, Events.onWalletCreate, {
      address: wallet.address,
    });
  }
}
