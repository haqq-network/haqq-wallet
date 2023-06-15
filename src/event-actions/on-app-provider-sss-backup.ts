import {navigator} from '@app/navigator';

export async function onAppProviderSssBackup(accountId: string) {
  navigator.navigate('backupSssNotification', {accountId: accountId});
}
