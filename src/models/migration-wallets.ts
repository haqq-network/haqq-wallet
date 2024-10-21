import {ProviderMnemonicTron} from '@haqq/rn-wallet-providers';

import {ETH_COIN_TYPE, TRON_COIN_TYPE} from '@app/variables/common';

import {Wallet, WalletModel} from './wallet';

import {app} from '../contexts';
import {AddressTron, WalletType} from '../types';

const NEW_WALLET_VERSION = 4;
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
  _wallet: WalletModel,
  _getPassword: () => Promise<string>,
): Promise<void> => {
  // TODO: generate tron address
};

const _migrateMnemonicWallet = async (
  wallet: WalletModel,
  getPassword: () => Promise<string>,
) => {
  // generate TRX address after 3 version
  if (wallet.version <= 3) {
    const tronProvider = new ProviderMnemonicTron({
      account: wallet.accountId!,
      getPassword,
      tronWebHostUrl: '', // this url used for TX signing
    });

    const {address} = await tronProvider.getAccountInfo(
      wallet.path?.replace(ETH_COIN_TYPE, TRON_COIN_TYPE)!,
    );

    Wallet.update(wallet.address, {
      version: NEW_WALLET_VERSION,
      tronAddress: address as AddressTron,
    });
  }
};

const _migrateSssWallet = async (
  _wallet: WalletModel,
  _getPassword: () => Promise<string>,
) => {
  // TODO: generate tron address
};
