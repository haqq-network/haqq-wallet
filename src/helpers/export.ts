import {ProviderMnemonicEvm, ProviderSSSEvm} from '@haqq/rn-wallet-providers';
import Clipboard from '@react-native-clipboard/clipboard';
import {ethers} from 'ethers';
import {Alert, NativeModules} from 'react-native';
import Config from 'react-native-config';

import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {WalletType} from '@app/types';
import {generateUUID} from '@app/utils';
import {ETH_HD_SHORT_PATH} from '@app/variables/common';

import {Banner, BannerButtonEvent, BannerType} from './../models/banner';
import {awaitForWallet} from './await-for-wallet';
import {getProviderInstanceForWallet} from './provider-instance';

const {Aes} = NativeModules;

/**
 * Function to encrypt a string using the given key.
 * A random initialization vector (IV) is generated, then AES-256-CBC encryption is performed.
 */
const encryptWithKey = async (text: string, password: string) => {
  try {
    const iv = await Aes.randomKey(16);
    const cipher = await Aes.encrypt(
      text,
      ethers.utils.sha256(Buffer.from(password, 'utf8')),
      iv,
      'aes-256-cbc',
    );
    return {cipher, iv};
  } catch (e) {
    Logger.error('Error during encryption:', e);
    throw e;
  }
};

/**
 * Function to decrypt encrypted data using the given key.
 */
const decryptWithKey = async (
  encryptedData: {cipher: string; iv: string},
  password: string,
) => {
  try {
    return await Aes.decrypt(
      encryptedData.cipher,
      ethers.utils.sha256(Buffer.from(password, 'utf8')),
      encryptedData.iv,
      'aes-256-cbc',
    );
  } catch (e) {
    Logger.error('Error during decryption:', e);
    throw e;
  }
};

/**
 * Encrypts a mnemonic string using a password.
 * Returns a JSON string containing the encrypted value, initialization vector, and salt.
 */
export const encryptMnemonic = async (mnemonic: string, password: string) => {
  const encryptedData = await encryptWithKey(mnemonic, password);
  return JSON.stringify(encryptedData);
};

/**
 * Decrypts a previously encrypted mnemonic string using a password.
 */
export const decryptMnemonic = async (
  encryptedString: string,
  password: string,
) => {
  const encryptedData = JSON.parse(encryptedString);
  return await decryptWithKey(encryptedData, password);
};

// haqqabi wallet support only mnemonic import
export const getWalletsForExport = () =>
  Wallet.getAll().filter(
    it => it.type === WalletType.mnemonic || it.type === WalletType.sss,
  );

export async function exportWallet() {
  const wallet = await awaitForWallet({
    wallets: getWalletsForExport(),
    title: I18N.selectAccount,
  });

  const network = Provider.getAll().find(
    it => it.isHaqqNetwork && it.isMainnet,
  );

  const walletModel = Wallet.getById(wallet)!;
  const walletProvider = await getProviderInstanceForWallet(
    walletModel,
    true,
    network,
  );

  if (
    !(walletProvider instanceof ProviderMnemonicEvm) &&
    !(walletProvider instanceof ProviderSSSEvm)
  ) {
    throw new Error('wallet_not_supported');
  }

  const mnemonic = await walletProvider.getMnemonicPhrase();
  const dataToExport = JSON.stringify({
    mnemonic,
    hd_path_index_array: Wallet.getAll()
      .filter(it => it.accountId === walletModel.accountId)
      .map(it => it.getPath(network)!.replace(`${ETH_HD_SHORT_PATH}/`, '')),
  });

  const exportKey = Config.EXPORT_KEY;

  const encrypted = await encryptMnemonic(dataToExport, exportKey);
  const decrypted = await decryptMnemonic(encrypted, exportKey);

  if (decrypted !== dataToExport) {
    throw new Error('decrypt_failed');
  }

  Alert.alert(
    'Encrypted wallet',
    JSON.stringify(JSON.parse(encrypted), null, 2),
    [{text: 'Copy', onPress: () => Clipboard.setString(encrypted)}],
  );
  return encrypted;
}

const generateExportBanner = (): Banner => {
  const id = generateUUID();

  return {
    id,
    type: BannerType.export,
    title: 'Export to Haqqabi',
    description: 'Export your mnemonic wallet to Haqqabi',
    backgroundColorFrom: '#1B6EE5',
    backgroundColorTo: '#2C8EEB',
    isUsed: false,
    snoozedUntil: new Date(),
    defaultEvent: BannerButtonEvent.export,
    defaultParams: {banner_id: id, type: 'export_wallet'},
    closeEvent: BannerButtonEvent.none,
    priority: 10,
  };
};

export function createExportBannerIfNotExists() {
  const banners = Banner.getAll();
  const existingBanner = banners.find(it => it.type === BannerType.export);
  if (existingBanner) {
    Banner.update(existingBanner.id, generateExportBanner());
  } else {
    Banner.create(generateExportBanner());
  }
}
