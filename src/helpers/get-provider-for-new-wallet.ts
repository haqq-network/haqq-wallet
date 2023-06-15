import {GENERATE_SHARES_URL, METADATA_URL} from '@env';
import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderSSSReactNative} from '@haqq/provider-sss-react-native';

import {app} from '@app/contexts';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {WalletInitialData} from '@app/types';

export async function getProviderForNewWallet(params: WalletInitialData) {
  const getPassword = app.getPassword.bind(app);

  if (params && params.type === 'sss') {
    const storage = await getProviderStorage('', 'cloud');
    return await ProviderSSSReactNative.initialize(
      params.sssPrivateKey || null,
      params.sssCloudShare || null,
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

  const keysSss = await ProviderSSSReactNative.getAccounts();

  if (keysSss.length) {
    const storage = await getProviderStorage(keysSss[0]);

    return new ProviderSSSReactNative({
      storage,
      account: keysSss[0],
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
