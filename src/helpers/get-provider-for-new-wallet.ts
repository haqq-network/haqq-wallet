import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';

import {app} from '@app/contexts';
import {GoogleDrive} from '@app/services/google-drive';
import {ProviderMpcReactNative} from '@app/services/provider-mpc';
import {StorageMock} from '@app/services/storage-mock';

export async function getProviderForNewWallet() {
  const getPassword = app.getPassword.bind(app);

  const keysMpc = await ProviderMpcReactNative.getAccounts();
  console.log('keysMpc', keysMpc);
  if (keysMpc.length) {
    const storage = app.isGoogleSignedIn
      ? await GoogleDrive.initialize()
      : new StorageMock();

    return new ProviderMpcReactNative({
      storage,
      account: keysMpc[0],
      getPassword,
    });
  }

  const keysMnemonic = await ProviderMnemonicReactNative.getAccounts();
  console.log('keysMnemonic', keysMnemonic);
  if (keysMnemonic.length) {
    return new ProviderMnemonicReactNative({
      account: keysMnemonic[0],
      getPassword,
    });
  }

  return await ProviderMnemonicReactNative.initialize(null, getPassword, {});
}
