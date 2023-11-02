import React, {memo, useEffect} from 'react';

import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {NavigationAction} from '@react-navigation/routers';
import {TransitionPresets} from '@react-navigation/stack';
import {StatusBar} from 'react-native';

import {Color} from '@app/colors';
import {HomeScreenLabel} from '@app/components/home-screen/label';
import {HomeScreenTabBarIcon} from '@app/components/home-screen/tab-bar-icon';
import {HomeScreenTitle} from '@app/components/home-screen/title';
import {Spacer} from '@app/components/ui';
import {useTypedNavigation} from '@app/hooks';
import {
  BrowserStack,
  BrowserStackRoutes,
} from '@app/screens/HomeStack/BrowserStack';
import {
  HomeFeedStack,
  HomeFeedStackRoutes,
} from '@app/screens/HomeStack/HomeFeedStack';
import {
  HomeNewsStack,
  NewsStackRoutes,
} from '@app/screens/HomeStack/HomeNewsStack';
import {
  SettingsStack,
  SettingsStackRoutes,
} from '@app/screens/HomeStack/SettingsStack';
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
};

const navigationOptions = {
  ...screenOptions,
  unmountOnBlur: true,
};

export const HomeScreen = memo(() => {
  const navigation = useTypedNavigation();
  useEffect(() => {
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

  return (
    <Tab.Navigator detachInactiveScreens screenOptions={navigationOptions}>
      <Tab.Screen
        name="homeFeed"
        component={HomeFeedStack}
        options={({route}) => ({
          ...feedOptions,
          tabBarStyle: (routeA => {
            const routeName = (getFocusedRouteNameFromRoute(routeA) ??
              HomeFeedStackRoutes.HomeFeed) as HomeFeedStackRoutes;
            const whitelist = [HomeFeedStackRoutes.HomeFeed];
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
        options={({route}) => ({
          ...browserOptions,
          tabBarStyle: (routeA => {
            const routeName = (getFocusedRouteNameFromRoute(routeA) ??
              BrowserStackRoutes.BrowserHomePage) as BrowserStackRoutes;
            const whitelist = [BrowserStackRoutes.BrowserHomePage];
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
        name="homeNews"
        component={HomeNewsStack}
        options={({route}) => ({
          ...newsOptions,
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
