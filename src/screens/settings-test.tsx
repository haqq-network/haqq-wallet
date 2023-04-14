import React, {useCallback, useState} from 'react';

import {CUSTOM_JWT_TOKEN, GENERATE_SHARES_URL, METADATA_URL} from '@env';
import {accountInfo} from '@haqq/provider-web3-utils';
import {getMetadataValue} from '@haqq/shared-react-native';
import messaging from '@react-native-firebase/messaging';
import {Alert, ScrollView} from 'react-native';

import {Color} from '@app/colors';
import {Button, ButtonVariant, Input, Spacer} from '@app/components/ui';
import {onUrlSubmit} from '@app/components/web3-browser/web3-browser-utils';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {createTheme, showModal} from '@app/helpers';
import {awaitForCaptcha} from '@app/helpers/await-for-captcha';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {parseJwt} from '@app/helpers/parse-jwt';
import {useTypedNavigation, useUser} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Banner} from '@app/models/banner';
import {Refferal} from '@app/models/refferal';
import {Web3BrowserBookmark} from '@app/models/web3-browser-bookmark';
import {Cloud} from '@app/services/cloud';
import {onAuthorized} from '@app/services/provider-mpc';
import {providerMpcInitialize} from '@app/services/provider-mpc-initialize';
import {PushNotifications} from '@app/services/push-notifications';
import {message as toastMessage} from '@app/services/toast';
import {Link} from '@app/types';
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

const TEST_URLS: Partial<Link>[] = [
  {title: 'app haqq network', url: 'https://app.haqq.network'},
  {title: 'vesting', url: 'https://vesting.haqq.network'},
  {title: 'app uniswap', url: 'https://app.uniswap.org'},
  {title: 'TestEdge2', url: 'https://testedge2.haqq.network'},
  {title: 'safe', url: 'https://safe.testedge2.haqq.network'},
  {
    title: 'metamask test dapp',
    url: 'https://metamask.github.io/test-dapp/',
  },
];

export const SettingsTestScreen = () => {
  const [isRequestPermission, setIsRequestPermission] = useState(false);
  const [wc, setWc] = useState('');
  const [browserUrl, setBrobserUrl] = useState('');
  const navigation = useTypedNavigation();
  const user = useUser();

  const onTurnOffDeveloper = useCallback(() => {
    user.isDeveloper = false;
    navigation.goBack();
  }, [user, navigation]);

  const onPressRequestPermissions = async () => {
    setIsRequestPermission(true);
    await PushNotifications.instance.requestPermissions();
    setIsRequestPermission(false);
  };

  const onPressWc = () => {
    app.emit(Events.onWalletConnectUri, wc);
  };

  const onPressOpenBrowser = () => {
    navigation.navigate('homeBrowser', {
      screen: 'web3browser',
      params: {url: onUrlSubmit(browserUrl)},
    });
  };

  const onCreateBanner = useCallback(() => {
    Banner.create({
      id: 'qwerty',
      title: 'Reward for creating the first account',
      description:
        'Join us in the spirit of Ramadan and claim your free ISLM coins.',
      type: 'claimCode',
      buttons: [
        {
          id: new Realm.BSON.UUID(),
          title: 'Claim reward',
          event: 'claimCode',
          params: {
            claim_code: 'qwerty',
          },
          color: '#01B26E',
          backgroundColor: '#EEF9F5',
        },
      ],
      backgroundColorFrom: '#1D69A4',
      backgroundColorTo: '#0C9FA5',
    });
  }, []);

  const onClearBanners = useCallback(() => {
    const banners = Banner.getAll();

    for (const banner of banners) {
      Banner.remove(banner.id);
      Refferal.remove(banner.id);
    }
  }, []);

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
      <Button
        title="Request permissions for push"
        loading={isRequestPermission}
        disabled={!!user.subscription}
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
        onPress={onPressOpenBrowser}
        variant={ButtonVariant.contained}
      />
      <Spacer height={5} />
      <Button
        title="load test bookmarks for browser"
        onPress={() => {
          TEST_URLS.forEach(link => {
            if (!Web3BrowserBookmark.getByUrl(link?.url || '')) {
              Web3BrowserBookmark.create(link);
            }
          });
          toastMessage('bookmarks loaded');
        }}
        variant={ButtonVariant.contained}
      />
      <Spacer height={5} />
      <Button
        title="Show modal"
        onPress={() =>
          showModal('error', {
            title: getText(I18N.modalRewardErrorTitle),
            description: getText(I18N.modalRewardErrorDescription),
            close: getText(I18N.modalRewardErrorClose),
            icon: 'reward_error',
            color: Color.graphicSecond4,
          })
        }
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
        title="create banner"
        onPress={onCreateBanner}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="clear banners"
        onPress={onClearBanners}
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

      <Spacer minHeight={100} />
      <Button
        title="Turn off developer"
        error
        onPress={onTurnOffDeveloper}
        variant={ButtonVariant.third}
      />
      <Spacer height={20} />
    </ScrollView>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
  },
});
