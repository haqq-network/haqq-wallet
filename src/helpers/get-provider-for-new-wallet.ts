import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';

import {app} from '@app/contexts';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {ProviderMpcReactNative} from '@app/services/provider-mpc';

export async function getProviderForNewWallet() {
  const getPassword = app.getPassword.bind(app);

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
