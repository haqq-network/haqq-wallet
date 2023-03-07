import {app} from '@app/contexts';
import {AsyncLocalStorage} from '@app/services/async-local-storage';
import {GoogleDrive} from '@app/services/google-drive';
import {StorageInterface} from '@app/services/provider-mpc';

export async function getProviderStorage(
  _accountId: string,
): Promise<StorageInterface> {
  if (app.isGoogleSignedIn) {
    return await GoogleDrive.initialize();
  }

  return new AsyncLocalStorage();
}
