import React, {useCallback, useEffect, useState} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import messaging from '@react-native-firebase/messaging';
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

const directParams = {
  baseUrl: 'http://localhost:3000/serviceworker/',
  enableLogging: true,
  network: 'testnet',
};
const serviceProvider = new TorusServiceProvider({
  customAuthArgs: directParams,
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

const GOOGLE = 'google';
const verifierMap = {
  [GOOGLE]: {
    name: 'Google',
    typeOfLogin: 'google',
    clientId:
      '759944447575-6rm643ia1i9ngmnme3eq5viiep5rp6s0.apps.googleusercontent.com',
    verifier: 'sk-react-native-test',
  },
};

export const SettingsTestScreen = () => {
  const [initialUrl, setInitialUrl] = useState<null | string>(null);
  const [torusPk, setTorusPk] = useState<null | BN>(null);
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
    } catch (error) {
      console.log(error, 'mounted caught');
    }
  }, []);

  const onPressCreateShare = useCallback(async () => {
    const answerString = await app.getPassword();
    try {
      const keyDetails = await tKey._initializeNewKey({
        initializeModules: true,
        importedKey: new BN(pk, 16),
      });

      console.log('keyDetails', JSON.stringify(keyDetails));
      console.log('tKey.privKey', tKey.privKey);

      const securityShare =
        await securityQuestionsModule.generateNewShareWithSecurityQuestions(
          answerString,
          'whats your password?',
        );

      console.log('securityShare', JSON.stringify(securityShare));
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      }
    }
  }, [pk]);

  const onPressRestoreShare1 = useCallback(async () => {
    const keyDetails = await tKey.initialize();
    console.log('keyDetails', keyDetails);
    const answerString = await app.getPassword();
    await securityQuestionsModule.inputShareFromSecurityQuestions(answerString);

    const res = await tKey.reconstructKey();
    console.log('onPressRestoreShare1', res.privKey);
    console.log('onPressRestoreShare1', res.seedPhrase);
    setPk(tKey.privKey.toString('hex'));
  }, []);

  //
  // const onPressRestoreShare2Mnemonic = useCallback(async () => {
  //   const deviceShare = await tKey.modules.shareSerializationModule.deserialize(
  //     mnemonicShare2,
  //     'mnemonic',
  //   );
  //
  //   console.log('deviceShare', deviceShare);
  //
  //   if (deviceShare) {
  //     try {
  //       await tKey.storageLayer.setMetadata({
  //         privKey: new BN(deviceShare, 'hex'),
  //         input: {message: 'KEY_NOT_FOUND'},
  //       });
  //
  //       console.log('initialize start');
  //       let keyDetails = await tKey.initialize(); // metadata is from the above step
  //       console.log('initialize end', keyDetails);
  //
  //       console.log('securityQuestions start');
  //       const answerString = await app.getPassword();
  //       await securityQuestionsModule.inputShareFromSecurityQuestions(
  //         answerString,
  //       );
  //       console.log('securityQuestions end');
  //
  //       const reconstructKey = await tKey.reconstructKey();
  //
  //       console.log('reconstructKey', reconstructKey);
  //     } catch (e) {
  //       console.log('initApp error', e.message);
  //     }
  //   }
  // }, [mnemonicShare2]);

  // const onRequestShare = useCallback(async () => {
  //   const res = await shareTransferModule.requestNewShare(
  //     'ReactNative',
  //     tKey.getCurrentShareIndexes(),
  //   );
  //
  //   console.log('res', res);
  // }, []);

  const onPressLogin = useCallback(async () => {
    try {
      console.log(new Date());
      const loginDetails = await CustomAuth.triggerLogin(verifierMap[GOOGLE]);
      console.log(new Date(), loginDetails);
      const key = new BN(loginDetails.privateKey, 16);
      tKey.serviceProvider.postboxKey = key;
      await tKey.initialize();
      setTorusPk(key);
      console.log(new Date(), JSON.stringify(loginDetails));
    } catch (e) {}
  }, []);

  const onPressSerialize = useCallback(async () => {
    const polyId = tKey.metadata.getLatestPublicPolynomial().getPolynomialID();
    const shares = tKey.shares[polyId];
    let deviceShare = null;
    for (const shareIndex in shares) {
      if (shareIndex !== '1') {
        deviceShare = shares[shareIndex].share;
      }
    }

    const share = await (
      tKey.modules.shareSerializationModule as ShareSerializationModule
    ).serialize(deviceShare?.share as BN, 'mnemonic');

    setSerializedShare(share as string);
  }, []);

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
        disabled={!!torusPk}
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
        disabled={!(pk && torusPk)}
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
      <Spacer height={4} />
      <Button
        title="Serialize"
        disabled={!(torusPk && !serializedShare)}
        onPress={onPressSerialize}
        variant={ButtonVariant.contained}
      />
      <Spacer height={4} />
      <Button
        title="Deserialize"
        disabled={!(torusPk && serializedShare)}
        onPress={onPressSerialize}
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
