import {WalletModel} from '@app/models/wallet';
import {navigator} from '@app/navigator';
import {HomeStackRoutes} from '@app/route-types';

export async function onAppMnemonicBackup(wallet: WalletModel) {
  navigator.navigate(HomeStackRoutes.BackupNotification, {wallet});
}
