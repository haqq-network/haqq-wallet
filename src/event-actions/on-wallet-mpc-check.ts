import {ProviderMpcReactNative} from '@haqq/provider-mpc-react-native';
import {isAfter} from 'date-fns';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {Wallet} from '@app/models/wallet';
import {WalletType} from '@app/types';
import {sleep} from '@app/utils';

export async function onWalletMpcCheck(snoozeBackup: Date) {
  if (isAfter(new Date(), snoozeBackup)) {
    const wallets = Wallet.getAll();

    const accounts = new Set(
      wallets
        .filter(w => w.type === WalletType.mpc && !w.isHidden && w.accountId)
        .map(w => w.accountId) as string[],
    );

    for (const accountId of accounts) {
      const storage = await getProviderStorage(accountId);

      if (storage.getName() === 'local') {
        await sleep(1000);
        app.emit(Events.onAppProviderMpcBackup, accountId);
        return;
      }

      const provider = new ProviderMpcReactNative({
        storage,
        account: accountId,
        getPassword: app.getPassword.bind(app),
      });

      const storages = await ProviderMpcReactNative.getStoragesForAccount(
        accountId,
      );

      const isShareSaved = await Promise.all(
        storages.map(async s => {
          const se = await getProviderStorage(accountId, s);
          return await provider.isShareSaved(se);
        }),
      );

      if (!isShareSaved.some(t => t)) {
        await sleep(1000);
        app.emit(Events.onAppProviderMpcBackup, accountId);
        return;
      }
    }
  }
}
