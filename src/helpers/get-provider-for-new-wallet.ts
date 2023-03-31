import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderMpcReactNative} from '@haqq/provider-mpc-react-native';

import {app} from '@app/contexts';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {providerMpcInitialize} from '@app/services/provider-mpc-initialize';
import {WalletInitialData} from '@app/types';
import {GENERATE_SHARES_URL, METADATA_URL} from '@app/variables/common';

export async function getProviderForNewWallet(params: WalletInitialData) {
  const getPassword = app.getPassword.bind(app);

  if (params) {
    if (params.type === 'mpc') {
      const storage = await getProviderStorage('', 'cloud');

      return await providerMpcInitialize(
        params.mpcPrivateKey,
        params.mpcCloudShare || null,
        null,
        params.verifier,
        params.token,
        app.getPassword.bind(app),
        storage,
        {
          metadataUrl: METADATA_URL,
          generateSharesUrl: GENERATE_SHARES_URL,
        },
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
