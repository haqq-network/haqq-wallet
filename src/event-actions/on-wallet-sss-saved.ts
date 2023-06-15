import {ProviderSSSReactNative} from '@haqq/provider-sss-react-native';

import {app} from '@app/contexts';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {Wallet} from '@app/models/wallet';
import {WalletType} from '@app/types';

export async function onWalletSssSaved(accountId: string) {
  const wallets = Wallet.getAll();

  const storage = await getProviderStorage(accountId);

  const provider = new ProviderSSSReactNative({
    account: accountId,
    storage,
    getPassword: app.getPassword.bind(app),
  });

  const storages = await ProviderSSSReactNative.getStoragesForAccount(
    accountId,
  );

  const isShareSaved = await Promise.all(
    storages.map(async s => {
      const se = await getProviderStorage(accountId, s);
      return await provider.isShareSaved(se);
    }),
  );

  const mnemonicSaved = isShareSaved.some(t => t);

  for (const wallet of wallets) {
    if (wallet.accountId === accountId && wallet.type === WalletType.sss) {
      wallet.update({mnemonicSaved});
      // TODO: socialLinkEnabled
      // wallet.update({socialLinkEnabled: true});
    }
  }
}
