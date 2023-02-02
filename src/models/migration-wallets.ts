import {decrypt} from '@haqq/encryption-react-native';
import {ProviderHotReactNative} from '@haqq/provider-hot-react-native';
import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';

import {Wallet} from './wallet';

import {app} from '../contexts';
import {WalletType} from '../types';

export async function migrationWallets() {
  const wallets = Wallet.getAll();
  const getPassword = app.getPassword.bind(app);
  const password = await getPassword();

  for (const wallet of wallets) {
    if (wallet.version === 1 && wallet.type === WalletType.hot) {
      const {privateKey} = await decrypt<{privateKey: string}>(
        password,
        wallet.data,
      );

      const provider = await ProviderHotReactNative.initialize(
        privateKey,
        getPassword,
        {},
      );

      wallet.update({
        data: '',
        version: 2,
        accountId: provider.getIdentifier(),
      });
    }

    if (wallet.version === 1 && wallet.type === WalletType.mnemonic) {
      const {mnemonic} = await decrypt<{mnemonic: {phrase: string} | string}>(
        password,
        wallet.data,
      );

      const m = typeof mnemonic === 'string' ? mnemonic : mnemonic.phrase;

      const provider = await ProviderMnemonicReactNative.initialize(
        m,
        getPassword,
        {},
      );

      if (wallet.mnemonicSaved) {
        await provider.setMnemonicSaved();
      }

      const rootAddress = wallets.filtered(
        `rootAddress = '${wallet.rootAddress}' AND type = '${WalletType.mnemonic}'`,
      );

      for (const w of rootAddress) {
        w.update({
          data: '',
          version: 2,
          accountId: provider.getIdentifier(),
        });
      }
    }
  }
}
