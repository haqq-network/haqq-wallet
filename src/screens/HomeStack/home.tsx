import React, {memo, useEffect, useState} from 'react';

import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {NavigationAction} from '@react-navigation/routers';
import {TransitionPresets} from '@react-navigation/stack';
import {StatusBar} from 'react-native';

import {HomeScreenLabel} from '@app/components/home-screen/label';
import {HomeScreenTabBarIcon} from '@app/components/home-screen/tab-bar-icon';
import {HomeScreenTitle} from '@app/components/home-screen/title';
import {Loading, Spacer} from '@app/components/ui';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {showModal} from '@app/helpers';
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
import {Color} from '@app/theme';
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

export const HomeScreen = memo(() => {
  const [isAppUnlocked, setIsAppUnlocked] = useState(app.isUnlocked);
  const navigation = useTypedNavigation();

  useEffectAsync(async () => {
    const walletToCheck = Wallet.getAllVisible().find(
      item => item.type === WalletType.sss && !!item.socialLinkEnabled,
    );
    if (walletToCheck && walletToCheck.accountId) {
      const storage = await getProviderStorage(walletToCheck.accountId);
      const cloudShare = await storage.getItem(
        `haqq_${walletToCheck.accountId.toLowerCase()}`,
      );
      const isReady = VariablesBool.get('isReadyForSSSVerification');
      if (!cloudShare && isReady) {
        showModal(ModalType.cloudShareNotFound, {wallet: walletToCheck});
      }
    }

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
  }, [navigation]);

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
