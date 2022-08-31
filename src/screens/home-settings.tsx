import {Alert, Button, Text, View} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {useWallets} from '../contexts/wallets';
import {CompositeScreenProps} from '@react-navigation/native';
import {useApp} from '../contexts/app';
import {Spacer} from '../components/spacer';
import {Container} from '../components/container';
import SwitchToggle from 'react-native-switch-toggle';
import {utils} from 'ethers';

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

  const onPressCreateWallet = useCallback(() => {
    wallet
      .addWalletFromMnemonic(
        utils.entropyToMnemonic(utils.randomBytes(16)),
        'Addition account',
      )
      .then(w => {
        Alert.alert('wallet created', w.name);
      });
  }, [wallet]);

  return (
    <Container>
      <Button title="Set pin" onPress={() => navigation.push('setPin')} />
      <View>
        <Text>Use biometry</Text>
        <SwitchToggle switchOn={app.biometry} onPress={onToggleBiometry} />
      </View>
      <Button title="create wallet" onPress={onPressCreateWallet} />
      <Button
        title="Import wallet"
        onPress={() => navigation.navigate('importWallet')}
      />

      {/*<Button*/}
      {/*  title="Transaction finish"*/}
      {/*  onPress={() =>*/}
      {/*    navigation.navigate('transaction', {*/}
      {/*      screen: 'transactionFinish',*/}
      {/*      params: {*/}
      {/*        hash: '0xaff27ee05ebe95f3aee19a4ac25289a8b0d26eb23abc6aa55d40da586e9cfed2',*/}
      {/*      },*/}
      {/*    })*/}
      {/*  }*/}
      {/*/>*/}

      <Spacer />
      <Button title="Logout" onPress={onLogout} />
    </Container>
  );
};
