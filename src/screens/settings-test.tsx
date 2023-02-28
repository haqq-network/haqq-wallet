import React, {useCallback, useEffect, useState} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import AsyncStorage from '@react-native-community/async-storage';
import messaging from '@react-native-firebase/messaging';
import {Metadata} from '@tkey/core';
import ThresholdKey from '@tkey/default';
import SecurityQuestionsModule from '@tkey/security-questions';
import TorusServiceProvider from '@tkey/service-provider-base';
import {ShareSerializationModule} from '@tkey/share-serialization';
import {ShareTransferModule} from '@tkey/share-transfer';
import TorusStorageLayer from '@tkey/storage-layer-torus';
import CustomAuth from '@toruslabs/customauth-react-native-sdk';
import BN from 'bn.js';
import {Linking, View} from 'react-native';

import {Button, ButtonVariant, Input, Spacer, Text} from '@app/components/ui';
import {app} from '@app/contexts';
import {createTheme, showModal} from '@app/helpers';
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

const serviceProvider = new TorusServiceProvider({
  customAuthArgs: {
    baseUrl: 'http://localhost:3000/serviceworker/',
    enableLogging: true,
    network: 'testnet',
  },
} as any);

const storageLayer = new TorusStorageLayer({
  hostUrl: 'https://metadata.tor.us',
});

const shareTransferModule = new ShareTransferModule();
const shareSerializationModule = new ShareSerializationModule();
const securityQuestionsModule = new SecurityQuestionsModule();

const tKey = new ThresholdKey({
  serviceProvider: serviceProvider,
  storageLayer,
  modules: {
    shareTransfer: shareTransferModule,
    shareSerializationModule: shareSerializationModule,
    securityQuestions: securityQuestionsModule,
  },
});

enum Providers {
  google,
}

const verifierMap = {
  [Providers.google]: {
    name: 'Google',
    typeOfLogin: 'google',
    clientId:
      '759944447575-6rm643ia1i9ngmnme3eq5viiep5rp6s0.apps.googleusercontent.com',
    verifier: 'sk-react-native-test',
  },
};

const METADATA_STORE = 'tkey_metadata';

export const SettingsTestScreen = () => {
  const [initialUrl, setInitialUrl] = useState<null | string>(null);
  const [metadata, setMetadata] = useState(false);
  const [torusPk, setTorusPk] = useState(false);
  const [serializedShare, setSerializedShare] = useState('');
  const [pk, setPk] = useState('');
  // const [share1, setShare1] = useState('');
  const onPressRequestPermissions = async () => {
    await pushNotifications.requestPermissions();
  };

  useEffect(() => {
    Linking.getInitialURL().then(result => {
      setInitialUrl(result);
    });

    try {
      CustomAuth.init({
        browserRedirectUri: 'https://scripts.toruswallet.io/redirect.html',
        redirectUri: 'torusapp://org.torusresearch.customauthexample/redirect',
        network: 'celeste', // details for test net
        enableLogging: true,
        enableOneKey: false,
        skipSw: true,
      });

      AsyncStorage.getItem(METADATA_STORE)
        .then(resp => {
          console.log('metadata', resp);
          if (resp) {
            tKey.metadata = Metadata.fromJSON(JSON.parse(resp));
            setMetadata(!!tKey.metadata);
          }
        })
        .then(() => app.getPassword())
        .then(answerString =>
          securityQuestionsModule.inputShareFromSecurityQuestions(answerString),
        );
    } catch (error) {
      console.log(error, 'mounted caught');
    }
  }, []);

  const onPressCreateShare = useCallback(async () => {
    const answerString = await app.getPassword();
    try {
      await tKey._initializeNewKey({
        initializeModules: true,
        importedKey: new BN(pk, 16),
      });

      const securityShare =
        await securityQuestionsModule.generateNewShareWithSecurityQuestions(
          answerString,
          'whats your password?',
        );

      console.log('securityShare', JSON.stringify(securityShare));

      const newShare = await tKey.generateNewShare();
      const polyId = tKey.metadata
        .getLatestPublicPolynomial()
        .getPolynomialID();

      const deviceShare =
        tKey.shares[polyId][newShare.newShareIndex.toString('hex')];

      const share = await (
        tKey.modules.shareSerializationModule as ShareSerializationModule
      ).serialize(deviceShare?.share.share as BN, 'mnemonic');

      console.log('deviceShare', JSON.stringify(deviceShare), share);

      setSerializedShare(share as string);

      await AsyncStorage.setItem(
        METADATA_STORE,
        JSON.stringify(tKey.getMetadata().toJSON()),
      );
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      }
    }
  }, [pk]);

  const onPressRestoreShare1 = useCallback(async () => {
    await tKey.initialize();

    const answerString = await app.getPassword();
    await securityQuestionsModule.inputShareFromSecurityQuestions(answerString);

    await tKey.reconstructKey();
    setPk(tKey.privKey.toString('hex'));
  }, []);

  const onPressLogin = useCallback(async () => {
    try {
      const start = new Date();
      console.log(start);
      const loginDetails = await CustomAuth.triggerLogin(
        verifierMap[Providers.google],
      );

      tKey.serviceProvider.postboxKey = new BN(loginDetails.privateKey, 16);
      await tKey.initialize();
      const end = new Date();
      setMetadata(!!tKey.metadata);
      setTorusPk(true);
      console.log(end, +end - +start, JSON.stringify(loginDetails));
    } catch (e) {}
  }, []);

  // const onPressSerialize = useCallback(async () => {
  //   const newShare = await tKey.generateNewShare();
  //
  //   const polyId = tKey.metadata.getLatestPublicPolynomial().getPolynomialID();
  //   const deviceShare =
  //     tKey.shares[polyId][newShare.newShareIndex.toString('hex')];
  //
  //   const share = await (
  //     tKey.modules.shareSerializationModule as ShareSerializationModule
  //   ).serialize(deviceShare?.share.share as BN, 'mnemonic');
  //
  //   setSerializedShare(share as string);
  //
  //   await AsyncStorage.setItem(
  //     METADATA_STORE,
  //     JSON.stringify(tKey.getMetadata().toJSON()),
  //   );
  // }, []);

  const onPressDeserialize = useCallback(async () => {
    if (serializedShare) {
      const deviceShare = await (
        tKey.modules.shareSerializationModule as ShareSerializationModule
      ).deserialize(serializedShare, 'mnemonic');

      await tKey.inputShare(deviceShare);
      await tKey.reconstructKey();
      setPk(tKey.privKey.toString('hex'));
    }
  }, [serializedShare]);

  return (
    <View style={styles.container}>
      {initialUrl && (
        <Text t11 onPress={() => Clipboard.setString(initialUrl)}>
          initialUrl: {initialUrl}
        </Text>
      )}
      <Button
        title="Request permissions for push"
        onPress={onPressRequestPermissions}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="Show modal"
        onPress={() => showModal('ledger-locked')}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="Login"
        disabled={torusPk}
        onPress={onPressLogin}
        variant={ButtonVariant.contained}
      />
      <Input
        placeholder="pk"
        value={pk}
        onChangeText={v => {
          setPk(v);
        }}
      />
      <Spacer height={4} />
      <Button
        title="Create shares"
        disabled={!(pk && metadata)}
        onPress={onPressCreateShare}
        variant={ButtonVariant.contained}
      />
      <Spacer height={4} />
      <Button
        title="Restore from first share"
        disabled={!torusPk}
        onPress={onPressRestoreShare1}
        variant={ButtonVariant.contained}
      />
      <Spacer height={4} />
      <Input
        placeholder="share"
        value={serializedShare}
        onChangeText={v => {
          setSerializedShare(v);
        }}
      />
      {/*<Spacer height={4} />*/}
      {/*<Button*/}
      {/*  title="Serialize"*/}
      {/*  disabled={!(metadata && !serializedShare && pk)}*/}
      {/*  onPress={onPressSerialize}*/}
      {/*  variant={ButtonVariant.contained}*/}
      {/*/>*/}
      <Spacer height={4} />
      <Button
        title="Deserialize"
        disabled={!(metadata && serializedShare)}
        onPress={onPressDeserialize}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
    </View>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
  },
});
