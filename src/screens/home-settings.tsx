import {Button, Text, View} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {useWallets} from '../contexts/wallets';
import {CompositeScreenProps} from '@react-navigation/native';
import {useApp} from '../contexts/app';
import {Spacer} from '../components/spacer';
import {Container} from '../components/container';
import SwitchToggle from 'react-native-switch-toggle';

type HomeSettingsScreenProp = CompositeScreenProps<any, any>;

export const HomeSettingsScreen = ({navigation}: HomeSettingsScreenProp) => {
  const wallet = useWallets();
  const app = useApp();
  const [biometry, setBiometry] = useState(app.biometry);

  const onToggleBiometry = useCallback(async () => {
    if (!biometry) {
      try {
        await app.biometryAuth();
        setBiometry(true);
      } catch (e) {
        setBiometry(false);
      }
    } else {
      setBiometry(false);
    }
  }, [app, biometry]);

  useEffect(() => {
    app.biometry = biometry;
  }, [app, biometry]);

  const onLogout = useCallback(async () => {
    await wallet.clean();
    await app.clean();
    navigation.replace('login');
  }, [wallet, app, navigation]);

  return (
    <Container>
      <Text>Settings Screen</Text>
      <Button title="Set pin" onPress={() => navigation.push('set-pin')} />
      <View>
        <Text>Use biometry</Text>
        <SwitchToggle switchOn={app.biometry} onPress={onToggleBiometry} />
      </View>
      <Spacer />
      <Button title="Logout" onPress={onLogout} />
    </Container>
  );
};
