import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';

import {app} from '@app/contexts';
import {Wallet} from '@app/models/wallet';
import {WalletType} from '@app/types';

export async function onWalletMnemonicSaved(accountId: string) {
  const wallets = Wallet.getAll();

  const provider = new ProviderMnemonicReactNative({
    account: accountId,
    getPassword: app.getPassword.bind(app),
  });

  const mnemonicSaved = await provider.isMnemonicSaved();

  for (const wallet of wallets) {
    if (wallet.accountId === accountId && wallet.type === WalletType.mnemonic) {
      wallet.update({mnemonicSaved});
    }
  }
}
