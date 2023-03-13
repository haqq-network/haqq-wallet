import {
  ProviderMpcReactNative,
  StorageInterface,
} from '@haqq/provider-mpc-react-native';

import {AsyncLocalStorage} from '@app/services/async-local-storage';
import {Cloud} from '@app/services/cloud';
import {GoogleDrive} from '@app/services/google-drive';

export async function getProviderStorage(
  accountId?: string,
): Promise<StorageInterface> {
  const storages = await ProviderMpcReactNative.getStoragesForAccount(
    accountId,
  );

  const cloudEnabled = await Cloud.isEnabled();
  const googleEnabled = await GoogleDrive.isEnabled();

  if (storages.includes('cloud') && cloudEnabled) {
    return new Cloud();
  }

  if (storages.includes('google') && googleEnabled) {
    return new GoogleDrive();
  }

  if (storages.includes('local')) {
    return new AsyncLocalStorage();
  }

  if (cloudEnabled) {
    return new Cloud();
  }

  if (googleEnabled) {
    return new GoogleDrive();
  }

  return new AsyncLocalStorage();
}
