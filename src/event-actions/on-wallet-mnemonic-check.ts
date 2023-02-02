import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {isAfter} from 'date-fns';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {Wallet} from '@app/models/wallet';
import {WalletType} from '@app/types';
import {sleep} from '@app/utils';

export async function onWalletMnemonicCheck(snoozeBackup: Date) {
  if (isAfter(new Date(), snoozeBackup)) {
    const wallets = Wallet.getAll();

    const accounts = new Set(
      wallets
        .filter(
          w => w.type === WalletType.mnemonic && !w.isHidden && w.accountId,
        )
        .map(w => w.accountId) as string[],
    );

    for (const accountId of accounts) {
      const provider = new ProviderMnemonicReactNative({
        account: accountId,
        getPassword: app.getPassword.bind(app),
      });

      const isMnemonicSaved = await provider.isMnemonicSaved();

      if (!isMnemonicSaved) {
        await sleep(1000);
        app.emit(Events.onAppMnemonicBackup, accountId);
        return;
      }
    }
  }
}
