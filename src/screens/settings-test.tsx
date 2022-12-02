import React from 'react';

import messaging from '@react-native-firebase/messaging';
import {View} from 'react-native';

import {Button, ButtonVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';

messaging().onMessage(async remoteMessage => {
  console.log('onMessage', remoteMessage);
});

messaging().onNotificationOpenedApp(remoteMessage => {
  console.log('onNotificationOpenedApp', remoteMessage);
});

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('setBackgroundMessageHandler', remoteMessage);
});

messaging()
  .getInitialNotification()
  .then(remoteMessage => {
    if (remoteMessage) {
      console.log('getInitialNotification', remoteMessage);
    }
  });

export const SettingsTestScreen = () => {
  const onPressRequestPermissions = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);

      const token = await messaging().getToken();
      console.log(token);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title="Request permissions"
        onPress={onPressRequestPermissions}
        variant={ButtonVariant.contained}
      />
    </View>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
  },
});
