import {decrypt} from '@haqq/encryption-react-native';
import {ProviderHotBase, ProviderMnemonicBase} from '@haqq/rn-wallet-providers';

import {Wallet} from './wallet';

import {app} from '../contexts';
import {WalletType} from '../types';

const getWalletForMigration = () =>
  Wallet.getAll().filter(w => w.version === 1 && w.data);

export async function migrationWallets() {
  try {
    const wallets = getWalletForMigration();

    if (!wallets.length) {
      return;
    }

    const getPassword = app.getPassword.bind(app);
    const password = await getPassword();

    for (const wallet of wallets) {
      if (wallet.type === WalletType.hot) {
        const {privateKey} = await decrypt<{privateKey: string}>(
          password,
          wallet.data,
        );

        const provider = await ProviderHotBase.initialize(
          privateKey,
          getPassword,
          {},
        );

        Wallet.update(wallet.address, {
          data: '',
          version: 2,
          accountId: provider.getIdentifier(),
        });
      }

      if (wallet.type === WalletType.mnemonic) {
        const {mnemonic} = await decrypt<{
          mnemonic: {phrase: string} | string;
        }>(password, wallet.data);

        const m = typeof mnemonic === 'string' ? mnemonic : mnemonic.phrase;

        const provider = await ProviderMnemonicBase.initialize(
          m,
          getPassword,
          {},
        );

        if (wallet.mnemonicSaved) {
          await provider.setMnemonicSaved();
        }

        const rootAddress = wallets.filter(
          w =>
            w.rootAddress === wallet.rootAddress &&
            w.type === WalletType.mnemonic,
        );

        for (const w of rootAddress) {
          Wallet.update(w.address, {
            data: '',
            version: 2,
            accountId: provider.getIdentifier(),
          });
        }
      }
    }
  } catch (err) {
    Logger.error('migrationWallets', err, {
      wallets: getWalletForMigration(),
    });
    Logger.captureException(err, 'migrationWallets');
  }
}
