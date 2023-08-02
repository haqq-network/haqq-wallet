import messaging from '@react-native-firebase/messaging';

import {app} from '@app/contexts';
import {onCheckAvailability} from '@app/event-actions/on-check-availability';
import {Events} from '@app/events';

export async function onAppActive() {
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        app.emit(Events.onPushNotification, remoteMessage);
      }
    });

  await onCheckAvailability();
}
