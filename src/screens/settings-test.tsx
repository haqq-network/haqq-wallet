import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {CUSTOM_JWT_TOKEN, GENERATE_SHARES_URL, METADATA_URL} from '@env';
import {accountInfo} from '@haqq/provider-web3-utils';
import {getMetadataValue} from '@haqq/shared-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import messaging from '@react-native-firebase/messaging';
import {Alert, Linking, ScrollView} from 'react-native';

import {Button, ButtonVariant, Input, Spacer, Text} from '@app/components/ui';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {createTheme, showModal} from '@app/helpers';
import {awaitForCaptcha} from '@app/helpers/await-for-captcha';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {parseJwt} from '@app/helpers/parse-jwt';
import {useTypedNavigation} from '@app/hooks';
import {Cloud} from '@app/services/cloud';
import {onAuthorized} from '@app/services/provider-mpc';
import {providerMpcInitialize} from '@app/services/provider-mpc-initialize';
import {pushNotifications} from '@app/services/push-notifications';
import {isValidUrl} from '@app/utils';
import {ETH_HD_PATH} from '@app/variables/common';

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
  const [wc, setWc] = useState('');
  const [browserUrl, setBrobserUrl] = useState('');
  const isValidBrowserUrl = useMemo(() => isValidUrl(browserUrl), [browserUrl]);
  const navigation = useTypedNavigation();
  const iCloud = useRef(new Cloud()).current;

  const onPressRequestPermissions = async () => {
    await pushNotifications.requestPermissions();
  };

  useEffect(() => {
    Linking.getInitialURL().then(result => {
      setInitialUrl(result);
    });
  }, []);

  const onPressWc = () => {
    app.emit(Events.onWalletConnectUri, wc);
  };

  const onPressOpenBrowser = () => {
    navigation.navigate('web3browser', {url: browserUrl});
  };

  const checkICloudFile = useCallback(async () => {
    const exists = await iCloud.hasItem(
      'haqq_0x82edd867f789c53b95dca44d5589697c747aaaa7',
    );
    console.log('exists', exists);
  }, [iCloud]);

  const readICloudFile = useCallback(async () => {
    const content = await iCloud.getItem('haqq_backup');
    console.log('read', content);
  }, [iCloud]);

  const onPressMPC = useCallback(async () => {
    const token = await fetch(CUSTOM_JWT_TOKEN, {
      method: 'POST',
      headers: {
        accept: 'application/json, text/plain, */*',
        'content-type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({
        email: 'andrey@haqq',
      }),
    });

    const authState = await token.json();

    const authInfo = parseJwt(authState.idToken);
    const creds = await onAuthorized('custom', authInfo.sub, authState.idToken);

    let cloudShare = null;

    if (creds.privateKey) {
      console.log('creds.privateKey', creds.privateKey);
      const walletInfo = await getMetadataValue(
        METADATA_URL,
        creds.privateKey,
        'socialShareIndex',
      );

      if (walletInfo) {
        console.log('walletInfo', walletInfo);

        const supported = await Cloud.isEnabled();

        if (supported) {
          const cloud = new Cloud();

          const account = await accountInfo(creds.privateKey);
          console.log(
            'account.address',
            `haqq_${account.address.toLowerCase()}`,
          );
          cloudShare = await cloud.getItem(
            `haqq_${account.address.toLowerCase()}`,
          );
        }
      }
    }

    const storage = await getProviderStorage();
    const provider = await providerMpcInitialize(
      creds.privateKey,
      cloudShare,
      null,
      creds.verifier,
      creds.token,
      app.getPassword.bind(app),
      storage,
      {metadataUrl: METADATA_URL, generateSharesUrl: GENERATE_SHARES_URL},
    );

    console.log('provider', provider);

    const message = await provider.signPersonalMessage(ETH_HD_PATH, 'test');

    console.log('message', message);
  }, []);

  return (
    <ScrollView style={styles.container}>
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
      <Spacer height={8} />
      <Input
        placeholder="https://app.haqq.network"
        value={browserUrl}
        onChangeText={setBrobserUrl}
      />
      <Spacer height={5} />
      <Button
        title="Open web3 browser"
        disabled={!isValidBrowserUrl}
        onPress={onPressOpenBrowser}
        variant={ButtonVariant.contained}
      />
      <Spacer height={5} />
      <Button
        title="Show modal"
        onPress={() => showModal('reward-error')}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="MPC"
        onPress={() => onPressMPC()}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="check cloud"
        onPress={() => checkICloudFile()}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="read cloud"
        onPress={() => readICloudFile()}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="Show captcha"
        onPress={async () => {
          try {
            const result = await awaitForCaptcha();
            Alert.alert('result', result);
          } catch (err) {
            // @ts-ignore
            Alert.alert('Error', err?.message);
          }
        }}
        variant={ButtonVariant.contained}
      />
    </ScrollView>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
  },
});
