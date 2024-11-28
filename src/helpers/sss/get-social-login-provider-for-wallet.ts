import {GoogleSignin} from '@react-native-google-signin/google-signin';

import {hasGoogleToken} from '@app/helpers/get-google-tokens';
import {IWalletModel} from '@app/models/wallet';
import {Creds, onLoginApple, onLoginGoogle} from '@app/services/provider-sss';
import {IS_ANDROID} from '@app/variables/common';

import {getProviderStorage} from './get-provider-storage';

/**
 * Returns a function that can be used to get login credentials for a existing wallet using social login.
 * @param wallet - The wallet to login to.
 * @returns A function that can be used to get login credentials for a existing wallet using social login.
 */
export const getSocialLoginProviderForWallet = async (
  wallet: IWalletModel | {accountId: string},
): Promise<() => Promise<Creds | null>> => {
  const storage = await getProviderStorage(wallet.accountId as string);
  const storageName = storage.getName();

  if (IS_ANDROID) {
    return onLoginGoogle;
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

    return isGoogle ? onLoginGoogle : onLoginApple;
  }
};
