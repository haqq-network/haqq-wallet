import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderMpcReactNative} from '@haqq/provider-mpc-react-native';

import {app} from '@app/contexts';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {
  serviceProviderOptions,
  storageLayerOptions,
} from '@app/services/provider-mpc';
import {WalletInitialData} from '@app/types';

export async function getProviderForNewWallet(params: WalletInitialData) {
  const getPassword = app.getPassword.bind(app);

  if (params) {
    if (params.type === 'mpc') {
      const storage = await getProviderStorage('', 'cloud');

      return await ProviderMpcReactNative.initialize(
        params.mpcPrivateKey,
        params.mpcSecurityQuestion || null,
        params.mpcCloudShare || null,
        null,
        app.getPassword.bind(app),
        storage,
        serviceProviderOptions as any,
        storageLayerOptions,
        {},
      );
    }
  }

  const keysMpc = await ProviderMpcReactNative.getAccounts();

  if (keysMpc.length) {
    const storage = await getProviderStorage(keysMpc[0]);

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
