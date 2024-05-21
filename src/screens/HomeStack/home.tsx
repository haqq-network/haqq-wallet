import React, {useCallback, useEffect, useState} from 'react';

import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {NavigationAction} from '@react-navigation/routers';
import {TransitionPresets} from '@react-navigation/stack';
import _ from 'lodash';
import {observer} from 'mobx-react';
import {StatusBar} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';

import {Color} from '@app/colors';
import {HomeScreenLabel} from '@app/components/home-screen/label';
import {HomeScreenTabBarIcon} from '@app/components/home-screen/tab-bar-icon';
import {HomeScreenTitle} from '@app/components/home-screen/title';
import {Loading, Spacer} from '@app/components/ui';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {showModal} from '@app/helpers';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {useTypedNavigation} from '@app/hooks';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {VariablesBool} from '@app/models/variables-bool';
import {Wallet} from '@app/models/wallet';
import {
  HomeFeedStackRoutes,
  NewsStackRoutes,
  SettingsStackRoutes,
} from '@app/route-types';
import {BrowserStack} from '@app/screens/HomeStack/BrowserStack';
import {HomeFeedStack} from '@app/screens/HomeStack/HomeFeedStack';
import {HomeNewsStack} from '@app/screens/HomeStack/HomeNewsStack';
import {SettingsStack} from '@app/screens/HomeStack/SettingsStack';
import {ModalType, WalletType} from '@app/types';
import {IS_IOS} from '@app/variables/common';

const Tab = createBottomTabNavigator();

const screenOptions: BottomTabNavigationOptions = {
  headerShadowVisible: false,
  headerStyle: {
    backgroundColor: Color.transparent,
  },
  headerTitleAlign: 'center',
  headerStatusBarHeight: IS_IOS ? undefined : 40,
  tabBarStyle: {
    backgroundColor: Color.transparent,
    borderTopWidth: 0,
    elevation: 0,
    height: IS_IOS ? 80 : 50,
    top: IS_IOS ? 0 : 8,
    marginBottom: IS_IOS ? 0 : 23,
  },
  tabBarItemStyle: {
    marginTop: 5,
    height: IS_IOS ? 50 : 40,
  },
  headerTitle: ({children}) => <HomeScreenTitle route={children} />,
  tabBarLabel: ({children, focused}) => (
    <HomeScreenLabel focused={focused} route={children} />
  ),
  lazy: true,
  unmountOnBlur: true,
};

const tabBarIcon = (route: string) => (props: {focused: boolean}) => (
  <HomeScreenTabBarIcon focused={props.focused} route={route} />
);

const feedOptions = {
  headerShown: false,
  tabBarIcon: tabBarIcon('homeFeed'),
};

const newsOptions: BottomTabNavigationOptions = {
  tabBarIcon: tabBarIcon('homeNews'),
  headerTitle: () => <Spacer />,
  headerBackground: () => <Spacer bg={Color.bg1} />,
  headerStyle: {
    height: StatusBar.currentHeight,
  },
  unmountOnBlur: true,
};

const browserOptions = {
  ...TransitionPresets.ModalSlideFromBottomIOS,
  headerShown: false,
  tabBarIcon: tabBarIcon('homeBrowser'),
  lazy: false,
  unmountOnBlur: false,
};

const settingsOptions = {
  headerShown: false,
  tabBarIcon: tabBarIcon('homeSettings'),
  unmountOnBlur: true,
};

const navigationOptions = {
  ...screenOptions,
  unmountOnBlur: true,
};

export const HomeScreen = observer(() => {
  const [isAppUnlocked, setIsAppUnlocked] = useState(app.isUnlocked);
  const navigation = useTypedNavigation();
  const walletToCheck = Wallet.getAllVisible().find(
    item => item.type === WalletType.sss && !!item.socialLinkEnabled,
  );

  const findDeepestValues = useCallback((obj: Record<string, unknown>) => {
    const rootKeys = Object.keys(obj);
    const result = {};

    for (let key of rootKeys) {
      let deepestValue = obj[key];
      while (typeof deepestValue === 'object') {
        //@ts-expect-error
        deepestValue = deepestValue[key];
      }
      //@ts-expect-error
      result[key] = deepestValue;
    }

    return result;
  }, []);

  const checkSSSCloudShare = async () => {
    if (walletToCheck && walletToCheck.accountId) {
      const storage = await getProviderStorage(walletToCheck.accountId);
      //TODO: Verify cloud share
      const cloudShare = await storage.getItem(
        `haqq_${walletToCheck.accountId.toLowerCase()}`,
      );
      const isReady = VariablesBool.get('isReadyForSSSVerification');
      if (!cloudShare && isReady) {
        showModal(ModalType.cloudShareNotFound, {wallet: walletToCheck});
      }
    }
  };

  const checkMnemonicLocalShare = async () => {
    const mnemonicWallets = Wallet.getAllVisible().filter(
      wallet => wallet.type === WalletType.mnemonic,
    );

    mnemonicWallets.forEach(async wallet => {
      const storageKey = `mnemonic_${wallet.accountId}`;
      const shareRaw = await EncryptedStorage.getItem(storageKey);
      let shareParsed = null;
      if (!shareRaw) {
        const address = wallet.address.toLowerCase();
        await Wallet.remove(address);
        await awaitForEventDone(Events.onWalletRemove, address);
        return;
      }

      try {
        shareParsed = JSON.parse(shareRaw);
      } catch (err) {
        Logger.error(
          'checkMnemonicLocalShare cant parse share:',
          shareRaw,
          err,
        );
      }

      if (shareParsed && typeof shareParsed === 'object') {
        //Verify required keys
        const requiredKeys = [
          'nonce',
          'polynomialID',
          'publicShare',
          'shareIndex',
        ];
        const shareKeys = Object.keys(shareParsed);
        const hasRequiredKeys = requiredKeys.every(k => shareKeys.includes(k));

        if (!hasRequiredKeys) {
          Logger.error('checkMnemonicLocalShare:', shareParsed);
          return;
        }

        // Fix deep values
        const valueRaw = findDeepestValues(shareParsed);

        // Do we have changes?
        const isEqual = _.isEqual(valueRaw, shareParsed);

        if (!isEqual) {
          const value = JSON.stringify(valueRaw);
          await EncryptedStorage.setItem(storageKey, value);
        }
      }
    });
  };

  useEffectAsync(async () => {
    await checkSSSCloudShare();
    await checkMnemonicLocalShare();

    const subscription = (e: {
      preventDefault: () => void;
      data: {action: NavigationAction};
    }) => {
      e.preventDefault();
    };

    navigation.addListener('beforeRemove', subscription);

    return () => {
      navigation.removeListener('beforeRemove', subscription);
    };
  }, [walletToCheck]);

  useEffect(() => {
    const sub = (unlocked: boolean) => {
      setIsAppUnlocked(unlocked);
    };
    app.on(Events.onAuthenticatedChanged, sub);
    return () => {
      app.off(Events.onAuthenticatedChanged, sub);
    };
  }, []);

  if (!isAppUnlocked) {
    return <Loading />;
  }

  return (
    <Tab.Navigator detachInactiveScreens screenOptions={navigationOptions}>
      <Tab.Screen
        name="homeFeed"
        component={HomeFeedStack}
        options={({route}) => ({
          ...feedOptions,
          tabBarTestID: 'homeFeed',
          tabBarStyle: (routeA => {
            const routeName = (getFocusedRouteNameFromRoute(routeA) ??
              HomeFeedStackRoutes.HomeFeed) as HomeFeedStackRoutes;
            const whitelist = [
              HomeFeedStackRoutes.HomeFeed,
              HomeFeedStackRoutes.HomeEarn,
            ];
            if (!whitelist.includes(routeName)) {
              return {
                height: 0,
                display: 'none',
              };
            }
            return screenOptions.tabBarStyle;
          })(route),
        })}
      />
      <Tab.Screen
        name="homeBrowser"
        component={BrowserStack}
        options={{
          ...browserOptions,
          tabBarTestID: 'homeBrowser',
          tabBarStyle: screenOptions.tabBarStyle,
        }}
      />
      <Tab.Screen
        name="homeNews"
        component={HomeNewsStack}
        options={({route}) => ({
          ...newsOptions,
          tabBarTestID: 'homeNews',
          tabBarStyle: (routeA => {
            const routeName = (getFocusedRouteNameFromRoute(routeA) ??
              NewsStackRoutes.News) as NewsStackRoutes;
            const whitelist = [NewsStackRoutes.News];
            if (!whitelist.includes(routeName)) {
              return {
                height: 0,
                display: 'none',
              };
            }
            return screenOptions.tabBarStyle;
          })(route),
        })}
      />
      <Tab.Screen
        name="homeSettings"
        component={SettingsStack}
        listeners={({navigation: nav}) => ({
          tabPress: e => {
            e.preventDefault();
            nav.navigate('homeSettings', {
              screen: SettingsStackRoutes.Home,
            });
          },
        })}
        options={({route}) => ({
          ...settingsOptions,
          tabBarTestID: 'homeSettings',
          tabBarStyle: (routeA => {
            const routeName = (getFocusedRouteNameFromRoute(routeA) ??
              SettingsStackRoutes.Home) as SettingsStackRoutes;
            const whitelist = [SettingsStackRoutes.Home];
            if (!whitelist.includes(routeName)) {
              return {
                height: 0,
                display: 'none',
              };
            }
            return screenOptions.tabBarStyle;
          })(route),
        })}
      />
    </Tab.Navigator>
  );
});
