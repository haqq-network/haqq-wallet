import {getUid} from '@app/helpers/get-uid';
import {VariablesString} from '@app/models/variables-string';
import {Backend} from '@app/services/backend';
import {WalletConnect} from '@app/services/wallet-connect';

export async function onPushTokenRefresh(token: string) {
  try {
    await WalletConnect.instance.setupPushNotifications(token);
    const subscriptionId = VariablesString.get('notificationToken');
    const uid = await getUid();
    if (subscriptionId && uid) {
      Backend.instance.updateNotificationToken(subscriptionId, token, uid);
    }
  } catch (err) {
    Logger.captureException(err, 'onPushTokenRefresh');
  }
}
