import {app} from '@app/contexts';
import {Wallet} from '@app/models/wallet';
import {GoogleDrive} from '@app/services/google-drive';
import {ProviderMpcReactNative} from '@app/services/provider-mpc';
import {StorageMock} from '@app/services/storage-mock';
import {WalletType} from '@app/types';

export async function onWalletMpcSaved(accountId: string) {
  const wallets = Wallet.getAll();

  const storage = app.isGoogleSignedIn
    ? await GoogleDrive.initialize()
    : new StorageMock();

  const provider = new ProviderMpcReactNative({
    account: accountId,
    storage,
    getPassword: app.getPassword.bind(app),
  });

  const mnemonicSaved = await provider.isShareSaved();

  for (const wallet of wallets) {
    if (wallet.accountId === accountId && wallet.type === WalletType.mpc) {
      wallet.update({mnemonicSaved});
    }
  }
}
