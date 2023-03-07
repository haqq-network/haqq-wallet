import {isAfter} from 'date-fns';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {Wallet} from '@app/models/wallet';
import {GoogleDrive} from '@app/services/google-drive';
import {ProviderMpcReactNative} from '@app/services/provider-mpc';
import {WalletType} from '@app/types';
import {sleep} from '@app/utils';

export async function onWalletMpcCheck(snoozeBackup: Date) {
  console.log('onWalletMpcCheck');
  if (isAfter(new Date(), snoozeBackup)) {
    const wallets = Wallet.getAll();

    console.log('wallets', wallets.toJSON());

    const accounts = new Set(
      wallets
        .filter(w => w.type === WalletType.mpc && !w.isHidden && w.accountId)
        .map(w => w.accountId) as string[],
    );

    for (const accountId of accounts) {
      if (!app.getUser().isGoogleSignedIn) {
        await sleep(1000);
        app.emit(Events.onAppProviderMpcBackup, accountId);
        return;
      }

      const storage = await GoogleDrive.initialize();

      const provider = new ProviderMpcReactNative({
        storage,
        account: accountId,
        getPassword: app.getPassword.bind(app),
      });

      const isShareSaved = await provider.isShareSaved();

      if (!isShareSaved) {
        await sleep(1000);
        app.emit(Events.onAppProviderMpcBackup, accountId);
        return;
      }
    }
  }
}
