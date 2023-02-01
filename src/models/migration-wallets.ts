import {decrypt} from '@haqq/encryption-react-native';
import {ProviderHotReactNative} from '@haqq/provider-hot-react-native';

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
        version: 2,
        accountId: provider.getIdentifier(),
      });
    }
  }
}
