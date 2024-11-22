import {ProviderSSSBase} from '@haqq/rn-wallet-providers';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

import {app} from '@app/contexts';
import {showModal} from '@app/helpers';
import {decryptLocalShare} from '@app/helpers/decrypt-local-share';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {getMetadataValueWrapped} from '@app/helpers/wrappers/get-metadata-value';
import {I18N, getText} from '@app/i18n';
import {ErrorHandler} from '@app/models/error-handler';
import {IWalletModel, Wallet} from '@app/models/wallet';
import {onLoginApple, onLoginGoogle} from '@app/services/provider-sss';
import {RemoteConfig} from '@app/services/remote-config';
import {ModalType, WalletType} from '@app/types';
import {sleep} from '@app/utils';
import {IS_ANDROID} from '@app/variables/common';

import {hasGoogleToken} from '../get-google-tokens';

export const generateNewSharesForWallet = async (wallet: IWalletModel) => {
  try {
    const getPassword = app.getPassword.bind(app);
    const password = await getPassword();

    const storage = await getProviderStorage(wallet.accountId as string);
    const storageName = storage.getName();
    Logger.log('storageName', storageName);

    let provider;
    if (IS_ANDROID) {
      provider = onLoginGoogle;
    } else {
      // try to check if google token is available
      let isGoogleSignedIn = false;
      let isGoogleTokenAvailable = false;
      try {
        isGoogleSignedIn = await GoogleSignin.isSignedIn();
      } catch (error) {
        isGoogleTokenAvailable = await hasGoogleToken();
      }
      const isGoogle =
        storageName.includes('google') ||
        isGoogleSignedIn ||
        isGoogleTokenAvailable;

      provider = isGoogle ? onLoginGoogle : onLoginApple;
    }
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

      const localShare = await decryptLocalShare(creds.privateKey, password);

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
      ).catch(err => {
        ErrorHandler.handle('sss1X', err);
      });

      if (wallet?.address) {
        Wallet.update(wallet.address, {socialLinkEnabled: true});
      }
    }
  } catch (err) {
    if (wallet?.address) {
      Wallet.update(wallet.address, {socialLinkEnabled: false});
    }
    Logger.captureException(err, 'generateNewSharesForWallet', {
      wallet: wallet,
    });
    showModal(ModalType.viewErrorDetails, {
      errorId: getText(I18N.blockRequestErrorTitle),
      errorDetails: (err as Error).message,
    });
  }
};

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
};
