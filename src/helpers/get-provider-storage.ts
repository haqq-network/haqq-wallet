import {
  ProviderSSSReactNative,
  StorageInterface,
} from '@haqq/provider-sss-react-native';

import {AsyncLocalStorage} from '@app/services/async-local-storage';
import {Cloud} from '@app/services/cloud';
import {GoogleDrive2} from '@app/services/google-drive-2';

export async function getProviderStorage(
  accountId?: string,
  storage?: string,
): Promise<StorageInterface> {
  const storages = storage
    ? [storage]
    : await ProviderSSSReactNative.getStoragesForAccount(accountId);

  const cloudEnabled = await Cloud.isEnabled();
  if (
    (storages.includes('cloud') || storages.includes('apple')) &&
    cloudEnabled
  ) {
    return new Cloud();
  }

  if (
    storages.includes('googleDrive') ||
    (storages.includes('google') && cloudEnabled)
  ) {
    return new GoogleDrive2();
  }

  if (storages.includes('local')) {
    return new AsyncLocalStorage();
  }

  if (cloudEnabled) {
    return new Cloud();
  }

  return new AsyncLocalStorage();
}
