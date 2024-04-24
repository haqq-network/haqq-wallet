import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderSSSReactNative} from '@haqq/provider-sss-react-native/src';
import Config from 'react-native-config';

import {app} from '@app/contexts';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {ErrorHandler} from '@app/models/error-handler';
import {RemoteConfig} from '@app/services/remote-config';
import {WalletInitialData} from '@app/types';

export async function getProviderForNewWallet(params?: WalletInitialData) {
  const getPassword = app.getPassword.bind(app);

  if (params && params.type === 'sss') {
    const storage = await getProviderStorage('', 'cloud');
    return await ProviderSSSReactNative.initialize(
      //@ts-ignore
      params.action === 'restore' ? params.sssPrivateKey || null : null,
      params.sssCloudShare || null,
      params.sssLocalShare || null,
      null,
      params.verifier,
      params.token,
      app.getPassword.bind(app),
      storage,
      {
        metadataUrl: RemoteConfig.get_env(
          'sss_metadata_url',
          Config.METADATA_URL,
        ) as string,
        generateSharesUrl: RemoteConfig.get_env(
          'sss_generate_shares_url',
          Config.GENERATE_SHARES_URL,
        ) as string,
      },
    ).catch(err => ErrorHandler.handle('sssLimitReached', err));
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
