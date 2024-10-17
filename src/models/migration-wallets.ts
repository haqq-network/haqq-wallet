import {decrypt} from '@haqq/encryption-react-native';
import {
  ProviderMnemonicBase,
  ProviderMnemonicTron,
} from '@haqq/rn-wallet-providers';

import {Wallet, WalletModel} from './wallet';

import {app} from '../contexts';
import {AddressTron, WalletType} from '../types';

const NEW_WALLET_VERSION = 3;
const getWalletForMigration = () =>
  Wallet.getAll().filter(w => w.version < NEW_WALLET_VERSION);

export async function migrationWallets() {
  try {
    const wallets = getWalletForMigration();

    if (!wallets.length) {
      return;
    }

    const getPassword = app.getPassword.bind(app);

    for (const wallet of wallets) {
      if (wallet.type === WalletType.hot) {
        _migrateHotWallet(wallet, getPassword);
      }

      if (wallet.type === WalletType.mnemonic) {
        _migrateMnemonicWallet(wallet, getPassword);
      }

      if (wallet.type === WalletType.sss) {
        _migrateSssWallet(wallet, getPassword);
      }
    }
  } catch (err) {
    Logger.error('migrationWallets', err, {
      wallets: getWalletForMigration(),
    });
    Logger.captureException(err, 'migrationWallets');
  }
}

const _migrateHotWallet = async (
  wallet: WalletModel,
  getPassword: () => Promise<string>,
): Promise<void> => {
  if (wallet.data) {
    const password = await getPassword();
    const {mnemonic} = await decrypt<{
      mnemonic: {phrase: string} | string;
    }>(password, wallet.data);

    const m = typeof mnemonic === 'string' ? mnemonic : mnemonic.phrase;
    const tronProvider = await ProviderMnemonicTron.initialize(
      m,
      getPassword,
      {},
    );
    const {address} = await tronProvider.getAccountInfo(wallet.path!);

    Wallet.update(wallet.address, {
      data: '',
      version: NEW_WALLET_VERSION,
      tronAddress: address as AddressTron,
    });
  }
};

const _migrateMnemonicWallet = async (
  wallet: WalletModel,
  getPassword: () => Promise<string>,
) => {
  if (wallet.data) {
    const password = await getPassword();
    const {mnemonic} = await decrypt<{
      mnemonic: {phrase: string} | string;
    }>(password, wallet.data);

    const m = typeof mnemonic === 'string' ? mnemonic : mnemonic.phrase;
    const provider = await ProviderMnemonicBase.initialize(m, getPassword, {});
    const tronProvider = await ProviderMnemonicTron.initialize(
      m,
      getPassword,
      {},
    );
    const {address} = await tronProvider.getAccountInfo(wallet.path!);

    if (wallet.mnemonicSaved) {
      await provider.setMnemonicSaved();
    }

    Wallet.update(wallet.address, {
      data: '',
      version: NEW_WALLET_VERSION,
      tronAddress: address as AddressTron,
    });
  }
};

const _migrateSssWallet = async (
  wallet: WalletModel,
  getPassword: () => Promise<string>,
) => {
  if (wallet.data) {
    const password = await getPassword();
    const {mnemonic} = await decrypt<{
      mnemonic: {phrase: string} | string;
    }>(password, wallet.data);

    const m = typeof mnemonic === 'string' ? mnemonic : mnemonic.phrase;
    const tronProvider = await ProviderMnemonicTron.initialize(
      m,
      getPassword,
      {},
    );
    const {address} = await tronProvider.getAccountInfo(wallet.path!);

    Wallet.update(wallet.address, {
      data: '',
      version: NEW_WALLET_VERSION,
      tronAddress: address as AddressTron,
    });
  }
};
