import {ProviderMnemonicBase, ProviderSSSBase} from '@haqq/rn-wallet-providers';

import {app} from '@app/contexts';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {ErrorHandler} from '@app/models/error-handler';
import {RemoteConfig} from '@app/services/remote-config';
import {WalletInitialData} from '@app/types';

export async function getProviderForNewWallet(params?: WalletInitialData) {
  const getPassword = app.getPassword.bind(app);

  if (params && params.type === 'sss') {
    const storage = await getProviderStorage('', params.provider);
    return await ProviderSSSBase.initialize(
      params.action === 'restore' ? params.sssPrivateKey || null : null,
      params.sssCloudShare || null,
      params.sssLocalShare || null,
      null,
      params.verifier,
      params.token.value,
      app.getPassword.bind(app),
      storage,
      {
        metadataUrl: RemoteConfig.get('sss_metadata_url')!,
        generateSharesUrl: RemoteConfig.get('sss_generate_shares_url')!,
      },
    ).catch(err => ErrorHandler.handle('sssLimitReached', err));
  }

  const keysSss = await ProviderSSSBase.getAccounts();

  if (keysSss.length) {
    const storage = await getProviderStorage(keysSss[0]);

    return new ProviderSSSBase({
      storage,
      account: keysSss[0],
      getPassword,
    });
  }

  const keysMnemonic = await ProviderMnemonicBase.getAccounts();

  if (keysMnemonic.length) {
    return new ProviderMnemonicBase({
      account: keysMnemonic[0],
      getPassword,
    });
  }

  return await ProviderMnemonicBase.initialize(null, getPassword, {});
}
