import {ProviderMnemonicBase} from '@haqq/rn-wallet-providers';

import {app} from '@app/contexts';
import {Wallet} from '@app/models/wallet';
import {WalletType} from '@app/types';

export async function onWalletMnemonicSaved(accountId: string) {
  const wallets = Wallet.getAll();

  const provider = new ProviderMnemonicBase({
    account: accountId,
    getPassword: app.getPassword.bind(app),
  });

  const mnemonicSaved = await provider.isMnemonicSaved();

  for (const wallet of wallets) {
    if (wallet.accountId === accountId && wallet.type === WalletType.mnemonic) {
      Wallet.update(wallet.address, {mnemonicSaved});
    }
  }
}
