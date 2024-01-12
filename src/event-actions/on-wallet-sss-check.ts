import {ProviderSSSReactNative} from '@haqq/provider-sss-react-native';
import {isAfter} from 'date-fns';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {Wallet} from '@app/models/wallet';
import {Cloud} from '@app/services/cloud';
import {WalletType} from '@app/types';
import {sleep} from '@app/utils';

export async function onWalletSssCheck(snoozeBackup: Date) {
  const cloudAvailable = await Cloud.isEnabled();

  if (cloudAvailable && isAfter(new Date(), snoozeBackup)) {
    const wallets = Wallet.getAll();

    const accounts = new Set(
      wallets
        .filter(w => w.type === WalletType.sss && !w.isHidden && w.accountId)
        .map(w => w.accountId) as string[],
    );

    for (const accountId of accounts) {
      if (cloudAvailable) {
        const storage = await getProviderStorage(accountId);
        const provider = new ProviderSSSReactNative({
          storage,
          account: accountId,
          getPassword: app.getPassword.bind(app),
        });

        const isShareSaved = provider.isShareSaved();

        if (!isShareSaved) {
          await sleep(1000);
          app.emit(Events.onAppProviderSssBackup, accountId);
          return;
        }
      }
    }
  }
}
