import React, {useCallback, useMemo, useState} from 'react';

import messaging from '@react-native-firebase/messaging';
import {Alert, ScrollView} from 'react-native';

import {Color} from '@app/colors';
import {Button, ButtonVariant, Input, Spacer} from '@app/components/ui';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {createTheme, showModal} from '@app/helpers';
import {awaitForCaptcha} from '@app/helpers/await-for-captcha';
import {onUrlSubmit} from '@app/helpers/web3-browser-utils';
import {useTypedNavigation, useUser} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Banner} from '@app/models/banner';
import {Provider} from '@app/models/provider';
import {Refferal} from '@app/models/refferal';
import {Web3BrowserBookmark} from '@app/models/web3-browser-bookmark';
import {PushNotifications} from '@app/services/push-notifications';
import {message as toastMessage} from '@app/services/toast';
import {Link} from '@app/types';

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
  {
    title: 'ChainList app',
    url: 'https://chainlist.org/',
  },
];

export const SettingsTestScreen = () => {
  const [isRequestPermission, setIsRequestPermission] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [wc, setWc] = useState('');
  const [browserUrl, setBrobserUrl] = useState('');
  const navigation = useTypedNavigation();
  const user = useUser();
  const provider = useMemo(
    () => Provider.getProvider(user.providerId),
    [user.providerId],
  );
  const onTurnOffDeveloper = useCallback(() => {
    user.isDeveloper = false;
    navigation.goBack();
  }, [user, navigation]);

  const onPressRequestPermissions = async () => {
    setIsRequestPermission(true);
    await PushNotifications.instance.requestPermissions();
    setIsRequestPermission(false);
  };

  const onPressSubscribeToNews = async () => {
    setIsSubscribing(true);
    await PushNotifications.instance.subscribeToTopic('news');
    setIsSubscribing(false);
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
      backgroundImage:
        'https://storage.googleapis.com/mobile-static/reward-banner-1.png',
    });
  }, []);

  const onClearBanners = useCallback(() => {
    const banners = Banner.getAll();

    for (const banner of banners) {
      Refferal.remove(banner.id);
      Banner.remove(banner.id);
    }
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
      {user.subscription && (
        <>
          <Spacer height={8} />
          <Button
            loading={isSubscribing}
            title="Subsctibe to news"
            onPress={onPressSubscribeToNews}
            variant={ButtonVariant.contained}
          />
        </>
      )}
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
        title="Show modal change on mainnet"
        onPress={() => {
          showModal('claimOnMainnet', {
            network: provider?.name,
            onChange: () => {
              app.getUser().providerId = '6d83b352-6da6-4a71-a250-ba222080e21f';
            },
          });
        }}
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
