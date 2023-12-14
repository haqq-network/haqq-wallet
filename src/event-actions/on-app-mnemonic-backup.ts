import {Wallet} from '@app/models/wallet';
import {navigator} from '@app/navigator';
import {HomeStackRoutes} from '@app/route-types';

export async function onAppMnemonicBackup(wallet: Wallet) {
  navigator.navigate(HomeStackRoutes.BackupNotification, {wallet});
}
