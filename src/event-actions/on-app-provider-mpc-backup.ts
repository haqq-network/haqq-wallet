import {navigator} from '@app/navigator';

export async function onAppProviderMpcBackup(accountId: string) {
  navigator.navigate('backupMpcNotification', {accountId: accountId});
}
