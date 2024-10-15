import {ProviderMnemonicBase} from '@haqq/rn-wallet-providers';

import {app} from '@app/contexts';
import {onStakingSync} from '@app/event-actions/on-staking-sync';
import {onTransactionsLoad} from '@app/event-actions/on-transactions-load';
import {onVestingSync} from '@app/event-actions/on-vesting-sync';
import {Events} from '@app/events';
import {getProviderInstanceForWallet} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {Wallet, WalletModel} from '@app/models/wallet';
import {Backend} from '@app/services/backend';
import {WalletType} from '@app/types';

export async function onWalletCreate(wallet: WalletModel) {
  try {
    let subscription = app.notificationToken;
    if (subscription) {
      await Backend.instance.createNotificationSubscription(
        subscription,
        AddressUtils.toHaqq(wallet.address),
      );

      Wallet.update(wallet.address, {subscription});
    }

    await Wallet.fetchBalances();

    await Promise.all([
      onTransactionsLoad(wallet.address),
      onStakingSync(),
      onVestingSync(),
    ]);

    if (!wallet.mnemonicSaved) {
      let mnemonicSaved: boolean;

      switch (wallet.type) {
        case WalletType.sss:
          mnemonicSaved = wallet.mnemonicSaved;
          break;
        case WalletType.mnemonic:
          const providerMnemonic = (await getProviderInstanceForWallet(
            wallet,
          )) as ProviderMnemonicBase;
          if (typeof providerMnemonic.isMnemonicSaved === 'function') {
            mnemonicSaved = await providerMnemonic.isMnemonicSaved();
          } else {
            mnemonicSaved = false;
          }
          break;
        default:
          mnemonicSaved = true;
      }

      Wallet.update(wallet.address, {
        mnemonicSaved,
      });
    }
  } catch (e) {
    Logger.captureException(e, Events.onWalletCreate, {
      address: wallet.address,
    });
  }
}
