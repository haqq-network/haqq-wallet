import React from 'react';

import messaging from '@react-native-firebase/messaging';
import {StyleSheet, View} from 'react-native';

import {Button, ButtonVariant} from '@app/components/ui';
import {showModal} from '@app/helpers';
import {useTypedNavigation} from '@app/hooks';
import {pushNotifications} from '@app/services/push-notifications';

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
  const navigation = useTypedNavigation();
  const onPressRequestPermissions = async () => {
    await pushNotifications.requestPermissions();
  };

  const onPressPopup = () => {
    navigation.navigate('notificationPopup');
  };

  return (
    <View style={styles.container}>
      <Button
        title="Request permissions"
        onPress={onPressRequestPermissions}
        variant={ButtonVariant.contained}
      />
      <Button
        title="Show popup"
        onPress={onPressPopup}
        variant={ButtonVariant.contained}
      />
      <Button
        title="Show no internet"
        onPress={() => showModal('error-create-account')}
        variant={ButtonVariant.contained}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
});
