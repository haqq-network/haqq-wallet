import {
  ProviderSSSReactNative,
  StorageInterface,
} from '@haqq/provider-sss-react-native';

import {AsyncLocalStorage} from '@app/services/async-local-storage';
import {Cloud} from '@app/services/cloud';
import {GoogleDrive} from '@app/services/google-drive';

export async function getProviderStorage(
  accountId?: string,
  storage?: string,
): Promise<StorageInterface> {
  const storages = storage
    ? [storage]
    : await ProviderSSSReactNative.getStoragesForAccount(accountId);

  const cloudEnabled = await Cloud.isEnabled();
  const googleEnabled = await GoogleDrive.isEnabled();

  if (storages.includes('cloud') && cloudEnabled) {
    return new Cloud();
  }

  if (storages.includes('googleDrive') && googleEnabled) {
    return new GoogleDrive();
  }

  if (storages.includes('local')) {
    return new AsyncLocalStorage();
  }

  if (googleEnabled) {
    return new GoogleDrive();
  }

  if (cloudEnabled) {
    return new Cloud();
  }

  return new AsyncLocalStorage();
}
