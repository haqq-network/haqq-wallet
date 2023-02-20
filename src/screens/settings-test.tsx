import React, {useEffect, useState} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import messaging from '@react-native-firebase/messaging';
import {Linking, View} from 'react-native';

import {Button, ButtonVariant, Input, Spacer, Text} from '@app/components/ui';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {createTheme, showModal} from '@app/helpers';
import {useTypedNavigation} from '@app/hooks';
import {pushNotifications} from '@app/services/push-notifications';

import {getProviderInstanceForWallet} from '../helpers';
import {Wallet} from '../models/wallet';

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
  const [initialUrl, setInitialUrl] = useState<null | string>(null);
  const navigation = useTypedNavigation();
  const [wc, setWc] = useState('');
  const onPressRequestPermissions = async () => {
    await pushNotifications.requestPermissions();
  };

  useEffect(() => {
    Linking.getInitialURL().then(result => {
      setInitialUrl(result);
    });
  }, []);

  const onPressPopup = () => {
    navigation.navigate('notificationPopup');
  };

  const onSignPersonalMessage = async () => {
    const wallet = Wallet.getById('0x6e03a60fdf8954b4c10695292baf5c4bdc34584b');
    if (wallet) {
      const provider = getProviderInstanceForWallet(wallet);

      const signature = await provider.signPersonalMessage(
        wallet.path!,
        'Example `personal_sign` message',
      );

      console.log('signature', signature);
    }
  };

  const onPressWc = () => {
    app.emit(Events.onWalletConnectUri, wc);
  };

  return (
    <View style={styles.container}>
      {initialUrl && (
        <Text t11 onPress={() => Clipboard.setString(initialUrl)}>
          initialUrl: {initialUrl}
        </Text>
      )}

      <Button
        title="Request permissions"
        onPress={onPressRequestPermissions}
        variant={ButtonVariant.contained}
      />
      <Spacer height={20} />

      <Input
        placeholder="wc:"
        value={wc}
        onChangeText={v => {
          setWc(v);
        }}
      />
      <Spacer height={5} />
      <Button
        title="wallet connect"
        disabled={!wc}
        onPress={onPressWc}
        variant={ButtonVariant.contained}
      />
      <Spacer height={20} />

      <Button
        title="Show popup"
        onPress={onPressPopup}
        variant={ButtonVariant.contained}
      />
      <Button
        title="Show Ledger attention"
        onPress={() => showModal('ledger-locked')}
        variant={ButtonVariant.contained}
      />
      <Button
        title="Sign personal message"
        onPress={onSignPersonalMessage}
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
