import {ProviderMnemonicEvm, ProviderSSSEvm} from '@haqq/rn-wallet-providers';
import Clipboard from '@react-native-clipboard/clipboard';
// @ts-ignore no-types
import base64 from 'base-64';
// @ts-ignore no-types
import getRandomValues from 'polyfill-crypto.getrandomvalues';
import {Alert, NativeModules} from 'react-native';
import Config from 'react-native-config';

import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {WalletType} from '@app/types';
import {generateUUID} from '@app/utils';

import {Banner, BannerButtonEvent, BannerType} from './../models/banner';
import {awaitForWallet} from './await-for-wallet';
import {getProviderInstanceForWallet} from './provider-instance';

const {Aes} = NativeModules;

/**
 * Generates a salt of the specified length (default is 16 bytes).
 * The salt is encoded in base64 so that it can be saved along with the encrypted data.
 */
const generateSalt = (byteCount = 16) => {
  const view = new Uint8Array(byteCount);
  getRandomValues(view);
  // Convert bytes to string and encode in base64
  return base64.encode(
    String.fromCharCode.apply(null, view as unknown as number[]),
  ) as string;
};

/**
 * Derives a key from the password and salt using PBKDF2.
 * Uses SHA-512 algorithm, 5000 iterations, and a key length of 256 bits.
 */
const keyFromPassword = (password: string, salt: string) => {
  return Aes.pbkdf2(password, salt, 5000, 256, 'sha512');
};

/**
 * Function to encrypt a string using the given key.
 * A random initialization vector (IV) is generated, then AES-256-CBC encryption is performed.
 */
const encryptWithKey = async (
  text: string,
  keyBase64: string,
  salt: string,
) => {
  try {
    const iv = await Aes.randomKey(16);
    const cipher = await Aes.encrypt(text, keyBase64, iv, 'aes-256-cbc');
    return {cipher, iv, salt};
  } catch (e) {
    Logger.error('Error during encryption:', e);
    throw e;
  }
};

/**
 * Function to decrypt encrypted data using the given key.
 */
const decryptWithKey = async (encryptedData: any, keyBase64: string) => {
  try {
    return await Aes.decrypt(
      encryptedData.cipher,
      keyBase64,
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
  const salt = generateSalt();
  const key = await keyFromPassword(password, salt);
  const encryptedData = await encryptWithKey(mnemonic, key, salt);
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
  const key = await keyFromPassword(password, encryptedData.salt);
  const decryptedMnemonic = await decryptWithKey(encryptedData, key);
  return decryptedMnemonic;
};

// haqqabi wallet support only mnemonic import
export function getWalletsForExport() {
  return Wallet.getAll().filter(
    it => it.type === WalletType.mnemonic || it.type === WalletType.sss,
  );
}

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
    address: walletModel.address,
    tron_address: walletModel.tronAddress,
    cosmos_address: walletModel.cosmosAddress,
    name: walletModel.name,
    hd_path: walletModel.getPath(network),
  });

  const exportKey = Config.EXPORT_KEY || 'abra-kadabra:)======)';

  const encrypted = await encryptMnemonic(dataToExport, exportKey);
  const decrypted = await decryptMnemonic(encrypted, exportKey);

  if (decrypted !== dataToExport) {
    throw new Error('decrypt_failed');
  }

  Logger.log('export_wallet', JSON.stringify(JSON.parse(encrypted), null, 2));
  Logger.log(
    'export_wallet',
    JSON.stringify(JSON.parse(dataToExport), null, 2),
  );
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
    // titleColor: 'textBase1',
    // descriptionColor: 'textBase1',
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
