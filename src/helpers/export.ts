import {ProviderMnemonicEvm, ProviderSSSEvm} from '@haqq/rn-wallet-providers';
import {uuidv4} from '@walletconnect/utils';
import {ethers} from 'ethers';
import {Alert, Linking, NativeModules} from 'react-native';
import Config from 'react-native-config';

import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {EventTracker} from '@app/services/event-tracker';
import {MarketingEvents, WalletType} from '@app/types';
import {generateUUID} from '@app/utils';
import {ETH_HD_SHORT_PATH} from '@app/variables/common';

import {Banner, BannerButtonEvent, BannerType} from './../models/banner';
import {awaitForWallet} from './await-for-wallet';
import {getProviderInstanceForWallet} from './provider-instance';

const {Aes} = NativeModules;
const HAQABI_SCHEME = 'haqabi://';

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

// haqabi wallet support only mnemonic import
export const getWalletsForExport = () =>
  Wallet.getAll().filter(
    it => it.type === WalletType.mnemonic || it.type === WalletType.sss,
  );

export async function isHaqqabiInstalled() {
  try {
    return await Linking.canOpenURL(HAQABI_SCHEME);
  } catch {
    return false;
  }
}

export async function exportWallet() {
  try {
    EventTracker.instance.trackEvent(MarketingEvents.exportWalletStart);
    const wallets = getWalletsForExport();

    if (!wallets.length) {
      EventTracker.instance.trackEvent(MarketingEvents.exportWalletFail, {
        error_id: 'no_wallets',
      });
      Alert.alert(
        "You don't have any wallets to export",
        'Haqabi wallet supports only mnemonic import.',
      );
      return;
    }

    const wallet = await awaitForWallet({
      wallets,
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

    if (await isHaqqabiInstalled()) {
      // open haqqabi app via deeplink to export wallet
      Linking.openURL(`${HAQABI_SCHEME}haqq-migration?data=${atob(encrypted)}`);
    } else {
      // open dynamic link to download haqqabi app
      EventTracker.instance.trackEvent(MarketingEvents.installHaqqabi);
      Linking.openURL('https://haqabi.onelink.me/zzKU/kubxompb');
    }

    EventTracker.instance.trackEvent(MarketingEvents.exportWalletSuccess);
  } catch (err) {
    const error_id = uuidv4();
    Logger.error('Error during export:', err);
    Logger.captureException(err, 'export_wallet', {err, error_id});
    EventTracker.instance.trackEvent(MarketingEvents.exportWalletFail, {
      error_id,
    });
  }
}

const generateExportBanner = (): Banner => {
  const id = generateUUID();

  return {
    id,
    type: BannerType.export,
    title: 'Export to Haqqabi',
    description: 'Export your mnemonic wallet to Haqqabi',
    isUsed: false,
    snoozedUntil: new Date(),
    defaultEvent: BannerButtonEvent.export,
    defaultParams: {banner_id: id, type: 'export_wallet'},
    closeEvent: BannerButtonEvent.none,
    backgroundImage: require('@assets/images/export-banner-bg.png'),
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
