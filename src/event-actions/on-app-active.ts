import messaging from '@react-native-firebase/messaging';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {EthRpcEndpointAvailability} from '@app/helpers/eth-rpc-endpoint-availability';

export async function onAppActive() {
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        app.emit(Events.onPushNotification, remoteMessage);
      }
    });

  await EthRpcEndpointAvailability.checkEthRpcEndpointAvailability();
}
