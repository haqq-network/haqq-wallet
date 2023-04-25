import {RemoteMessage} from '@app/types';

export async function onPushNotification(message: RemoteMessage) {
  console.log('onPushNotification', message);
}
