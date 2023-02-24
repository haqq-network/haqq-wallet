import React, {useCallback, useEffect, useState} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import messaging from '@react-native-firebase/messaging';
import ThresholdKey from '@tkey/default';
import SecurityQuestionsModule from '@tkey/security-questions';
import TorusServiceProvider from '@tkey/service-provider-base';
import {ShareSerializationModule} from '@tkey/share-serialization';
import {ShareTransferModule} from '@tkey/share-transfer';
import TorusStorageLayer from '@tkey/storage-layer-torus';
import BN from 'bn.js';
import randombytes from 'randombytes';
import {Linking, View} from 'react-native';

import {Button, ButtonVariant, Input, Spacer, Text} from '@app/components/ui';
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

export const SettingsTestScreen = () => {
  const [initialUrl, setInitialUrl] = useState<null | string>(null);
  const [pk, setPk] = useState('');
  const [share1, setShare1] = useState('');
  const [mnemonicShare2, setMnemonicShare2] = useState('');
  const onPressRequestPermissions = async () => {
    await pushNotifications.requestPermissions();
  };

  useEffect(() => {
    Linking.getInitialURL().then(result => {
      setInitialUrl(result);
    });
  }, []);

  const onPressCreateShare = useCallback(async () => {
    const key = randombytes(32);

    tKey.serviceProvider.postboxKey = new BN(key);
    console.log('share1', key.toString('hex'));
    let keyDetails = await tKey.initialize();
    console.log('keyDetails', keyDetails);

    const polyId = tKey.metadata.getLatestPublicPolynomial().getPolynomialID();

    console.log('polyId', polyId);

    console.log(JSON.stringify(tKey.shares));

    const shares = tKey.shares[polyId];
    let deviceShare = null;
    for (const shareIndex in shares) {
      if (shareIndex !== '1') {
        deviceShare = shares[shareIndex].share;
      }
    }
    if (deviceShare) {
      console.log('deviceShare', deviceShare);

      const serializedShare =
        await tKey.modules.shareSerializationModule.serialize(
          deviceShare.share,
          'mnemonic',
        );

      console.log('serializedShare', serializedShare);
    }

    const securityShare =
      await tKey.modules.securityQuestions.generateNewShareWithSecurityQuestions(
        '123',
        'whats your password?',
      );

    console.log('securityShare', JSON.stringify(securityShare));
  }, []);

  const onPressRestoreShare1 = useCallback(async () => {
    tKey.serviceProvider.postboxKey = new BN(share1, 'hex');
    const keyDetails = await tKey.initialize();
    console.log('keyDetails', keyDetails);

    await tKey.modules.securityQuestions.inputShareFromSecurityQuestions('123');

    const res = await tKey.reconstructKey();
    console.log('onPressRestoreShare1', res.privKey);
  }, [share1]);

  const onPressRestoreShare2Mnemonic = useCallback(async () => {
    const deviceShare = await tKey.modules.shareSerializationModule.deserialize(
      mnemonicShare2,
      'mnemonic',
    );

    console.log('deviceShare', deviceShare);

    if (deviceShare) {
      try {
        await tKey.storageLayer.setMetadata({
          privKey: new BN(deviceShare, 'hex'),
          input: {message: 'KEY_NOT_FOUND'},
        });

        console.log('initialize start');
        let keyDetails = await tKey.initialize(); // metadata is from the above step
        console.log('initialize end', keyDetails);

        console.log('securityQuestions start');
        await tKey.modules.securityQuestions.inputShareFromSecurityQuestions(
          '123',
        );
        console.log('securityQuestions end');

        const reconstructKey = await tKey.reconstructKey();

        console.log('reconstructKey', reconstructKey);
      } catch (e) {
        console.log('initApp error', e.message);
      }
    }
  }, [mnemonicShare2]);

  const onRequestShare = useCallback(async () => {
    const res = await tKey.modules.shareTransfer.requestNewShare(
      'ReactNative',
      tKey.getCurrentShareIndexes(),
    );

    console.log('res', res);
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
        disabled={!pk}
        onPress={onPressCreateShare}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Input
        placeholder="share1"
        value={share1}
        onChangeText={v => {
          setShare1(v);
        }}
      />
      <Spacer height={4} />
      <Button
        title="Restore from first share"
        disabled={!share1}
        onPress={onPressRestoreShare1}
        variant={ButtonVariant.contained}
      />

      <Spacer height={4} />
      <Button
        title="Request share"
        disabled={!share1}
        onPress={onRequestShare}
        variant={ButtonVariant.contained}
      />

      <Spacer height={8} />
      <Input
        placeholder="mnemonicShare2"
        value={mnemonicShare2}
        onChangeText={v => {
          setMnemonicShare2(v);
        }}
      />
      <Spacer height={4} />
      <Button
        title="Restore from mnemonic"
        disabled={!mnemonicShare2}
        onPress={onPressRestoreShare2Mnemonic}
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
