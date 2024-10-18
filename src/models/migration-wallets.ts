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
  const wallets = getWalletForMigration();

  if (!wallets.length) {
    return;
  }

  const getPassword = app.getPassword.bind(app);

  for (const wallet of wallets) {
    try {
      if (wallet.type === WalletType.hot) {
        await _migrateHotWallet(wallet, getPassword);
      }

      if (wallet.type === WalletType.mnemonic) {
        await _migrateMnemonicWallet(wallet, getPassword);
      }

      if (wallet.type === WalletType.sss) {
        await _migrateSssWallet(wallet, getPassword);
      }
    } catch (err) {
      Logger.error('migrationWallets', err, {
        current_wallet: wallet.address,
        wallets: getWalletForMigration(),
      });
      Logger.captureException(err, 'migrationWallets', {wallet});
    }
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
    const tronProvider = await ProviderMnemonicTron.initialize(m, getPassword, {
      account: wallet.accountId!,
      tronWebHostUrl: '', // this url used for TX signing
    });
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
  // Convert legacy wallet to new format
  if (wallet.data) {
    const password = await getPassword();
    const {mnemonic} = await decrypt<{
      mnemonic: {phrase: string} | string;
    }>(password, wallet.data);

    const m = typeof mnemonic === 'string' ? mnemonic : mnemonic.phrase;
    const provider = await ProviderMnemonicBase.initialize(m, getPassword, {});

    if (wallet.mnemonicSaved) {
      await provider.setMnemonicSaved();
    }

    Wallet.update(wallet.address, {
      data: '',
      version: NEW_WALLET_VERSION,
    });
  }

  // generate TRX address
  if (wallet.version < 3) {
    const tronProvider = new ProviderMnemonicTron({
      account: wallet.accountId!,
      getPassword,
      tronWebHostUrl: '', // this url used for TX signing
    });
    const {address} = await tronProvider.getAccountInfo(wallet.path!);

    Wallet.update(wallet.address, {
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
    const tronProvider = await ProviderMnemonicTron.initialize(m, getPassword, {
      account: wallet.accountId!,
      tronWebHostUrl: '', // this url used for TX signing
    });
    const {address} = await tronProvider.getAccountInfo(wallet.path!);

    Wallet.update(wallet.address, {
      data: '',
      version: NEW_WALLET_VERSION,
      tronAddress: address as AddressTron,
    });
  }
};
