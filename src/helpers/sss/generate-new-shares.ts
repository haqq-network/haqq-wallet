import {ProviderSSSBase} from '@haqq/rn-wallet-providers';
import {Alert} from 'react-native';

import {app} from '@app/contexts';
import {I18N, getText} from '@app/i18n';
import {IWalletModel, Wallet} from '@app/models/wallet';
import {RemoteConfig} from '@app/services/remote-config';
import {WalletType} from '@app/types';
import {sleep} from '@app/utils';

import {decryptLocalShare} from './decrypt-local-share';
import {getMetadataValueWrapped} from './get-metadata-value';
import {getProviderStorage} from './get-provider-storage';
import {getSocialLoginProviderForWallet} from './get-social-login-provider-for-wallet';

/**
 * @param {IWalletModel} wallet - wallet to restore
 * restore cloud shares for the wallet
 */
export const generateNewSharesForWallet = async (wallet: IWalletModel) => {
  try {
    const getPassword = app.getPassword.bind(app);
    const password = await getPassword();

    const storage = await getProviderStorage(wallet.accountId as string);

    const provider = await getSocialLoginProviderForWallet(wallet);
    const creds = await provider();

    if (creds) {
      if (!creds.privateKey) {
        throw new Error('No Private Key Detected');
      }

      const walletInfo = await getMetadataValueWrapped(
        RemoteConfig.get('sss_metadata_url')!,
        creds.privateKey,
        'socialShareIndex',
      );

      if (!walletInfo) {
        throw new Error('No Wallet Info Detected');
      }

      const localShare = await decryptLocalShare(
        creds.privateKey,
        password,
        wallet.address,
      );

      if (!localShare) {
        throw new Error('No Local Share found on device');
      }

      await ProviderSSSBase.initialize(
        creds.privateKey,
        null,
        localShare,
        null,
        creds.verifier,
        creds.token,
        getPassword,
        storage,
        {
          metadataUrl: RemoteConfig.get('sss_metadata_url')!,
          generateSharesUrl: RemoteConfig.get('sss_generate_shares_url')!,
        },
      );

      if (wallet?.address) {
        Wallet.update(wallet.address, {socialLinkEnabled: true});
      }
    }
  } catch (err) {
    Alert.alert(
      getText(I18N.settingsSecurityRewriteCloudBackup),
      (err as Error).message,
    );
    if (wallet?.address) {
      Wallet.update(wallet.address, {socialLinkEnabled: false});
    }
    Logger.captureException(err, 'generateNewSharesForWallet', {
      wallet: wallet,
    });
  }
};

/**
 * @returns {boolean} - true if at least one SSS wallet was restored
 */
export const generateNewSharesForAll = async () => {
  const restoredWallets: string[] = [];
  for await (const wallet of Wallet.getAll()) {
    if (
      wallet.type === WalletType.sss &&
      !restoredWallets.includes(wallet.accountId!)
    ) {
      await generateNewSharesForWallet(wallet);
      restoredWallets.push(wallet.accountId!);
      await sleep(1000);
    }
  }
  return !!restoredWallets.length;
};
