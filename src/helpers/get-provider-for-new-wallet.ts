import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';

import {app} from '@app/contexts';
import {AsyncLocalStorage} from '@app/services/async-local-storage';
import {GoogleDrive} from '@app/services/google-drive';
import {ProviderMpcReactNative} from '@app/services/provider-mpc';

export async function getProviderForNewWallet() {
  const getPassword = app.getPassword.bind(app);

  const keysMpc = await ProviderMpcReactNative.getAccounts();

  if (keysMpc.length) {
    const storage = app.isGoogleSignedIn
      ? await GoogleDrive.initialize()
      : new AsyncLocalStorage();

    return new ProviderMpcReactNative({
      storage,
      account: keysMpc[0],
      getPassword,
    });
  }

  const keysMnemonic = await ProviderMnemonicReactNative.getAccounts();

  if (keysMnemonic.length) {
    return new ProviderMnemonicReactNative({
      account: keysMnemonic[0],
      getPassword,
    });
  }

  return await ProviderMnemonicReactNative.initialize(null, getPassword, {});
}
