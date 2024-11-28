import {ProviderSSSBase} from '@haqq/rn-wallet-providers';

import {app} from '@app/contexts';
import {getProviderStorage} from '@app/helpers/sss';
import {Wallet} from '@app/models/wallet';
import {WalletType} from '@app/types';

export async function onWalletSssSaved(accountId: string) {
  const wallets = Wallet.getAll();

  const storage = await getProviderStorage(accountId);
  const provider = new ProviderSSSBase({
    account: accountId,
    storage,
    getPassword: app.getPassword.bind(app),
  });

  const storages = await ProviderSSSBase.getStoragesForAccount(accountId);

  const isShareSaved = await Promise.all(
    storages.map(async s => {
      const se = await getProviderStorage(accountId, s);
      return await provider.isShareSaved(se);
    }),
  );

  const socialLinkEnabled = isShareSaved.some(t => t);

  for (const wallet of wallets) {
    if (wallet.accountId === accountId && wallet.type === WalletType.sss) {
      Wallet.update(wallet.address, {socialLinkEnabled});
    }
  }
}
