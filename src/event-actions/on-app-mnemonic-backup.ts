import {navigator} from '@app/navigator';

export async function onAppMnemonicBackup(accountId: string) {
  navigator.navigate('backupNotification', {accountId: accountId});
}
