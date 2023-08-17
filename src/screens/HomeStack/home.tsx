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
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {useTypedNavigation} from '@app/hooks';
import {useProvider} from '@app/hooks/use-provider';
import {
  BrowserStack,
  BrowserStackRoutes,
} from '@app/screens/HomeStack/BrowserStack';
import {
  HomeEarnStack,
  HomeEarnStackRoutes,
} from '@app/screens/HomeStack/HomeEarnStack';
import {HomeStakingScreen} from '@app/screens/HomeStack/HomeEarnStack/home-staking';
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

const earnOptions = {
  tabBarIcon: tabBarIcon('homeEarn'),
};

const newsOptions: BottomTabNavigationOptions = {
  tabBarIcon: tabBarIcon('homeNews'),
  headerTitle: () => <Spacer />,
  headerBackground: () => <Spacer bg={Color.bg1} />,
  headerStyle: {
    height: StatusBar.currentHeight,
  },
};

const stakingOptions = {
  unmountOnBlur: true,
  tabBarIcon: tabBarIcon('homeStaking'),
};

const browserOptions = {
  ...TransitionPresets.ModalSlideFromBottomIOS,
  headerShown: false,
  tabBarIcon: tabBarIcon('homeBrowser'),
};

const settingsOptions = {
  headerShown: false,
  tabBarIcon: tabBarIcon('homeSettings'),
};

export const HomeScreen = memo(() => {
  const provider = useProvider();
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

  const isEarnEnabled: boolean = isFeatureEnabled(Feature.earn);
  const initialRouteName = isEarnEnabled
    ? HomeEarnStackRoutes.HomeEarn
    : HomeEarnStackRoutes.Staking;
  const stack = isEarnEnabled ? HomeEarnStack : HomeStakingScreen;

  return (
    <Tab.Navigator detachInactiveScreens screenOptions={screenOptions}>
      <Tab.Screen
        name="homeFeed"
        component={HomeFeedStack}
        options={({route}) => ({
          ...feedOptions,
          tabBarStyle: (routeA => {
            const routeName = (getFocusedRouteNameFromRoute(routeA) ??
              HomeFeedStackRoutes.HomeFeed) as HomeFeedStackRoutes;
            if (routeName !== HomeFeedStackRoutes.HomeFeed) {
              return {
                height: 0,
              };
            }
            return screenOptions.tabBarStyle;
          })(route),
        })}
      />
      <Tab.Screen
        name="homeEarn"
        component={stack}
        options={({route}) => ({
          ...(isEarnEnabled ? earnOptions : stakingOptions),
          headerShown: (routeA => {
            const routeName =
              getFocusedRouteNameFromRoute(routeA) ?? initialRouteName;

            if (routeName !== initialRouteName) {
              return false;
            }
            return true;
          })(route),
          tabBarStyle: (routeA => {
            const routeName =
              getFocusedRouteNameFromRoute(routeA) ?? initialRouteName;

            if (routeName !== initialRouteName) {
              return {
                height: 0,
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
            if (routeName !== NewsStackRoutes.News) {
              return {
                height: 0,
              };
            }
            return screenOptions.tabBarStyle;
          })(route),
        })}
      />
      {provider?.ethChainId && provider?.ethChainId !== 11235 && (
        <Tab.Screen
          name="homeBrowser"
          component={BrowserStack}
          options={({route}) => ({
            ...browserOptions,
            tabBarStyle: (routeA => {
              const routeName = (getFocusedRouteNameFromRoute(routeA) ??
                BrowserStackRoutes.BrowserHomePage) as BrowserStackRoutes;
              if (routeName !== BrowserStackRoutes.BrowserHomePage) {
                return {
                  height: 0,
                };
              }
              return screenOptions.tabBarStyle;
            })(route),
          })}
        />
      )}
      <Tab.Screen
        name="homeSettings"
        component={SettingsStack}
        options={({route}) => ({
          ...settingsOptions,
          tabBarStyle: (routeA => {
            const routeName =
              getFocusedRouteNameFromRoute(routeA) ?? SettingsStackRoutes.Home;

            if (routeName !== SettingsStackRoutes.Home) {
              return {
                height: 0,
              };
            }
            return screenOptions.tabBarStyle;
          })(route),
        })}
      />
    </Tab.Navigator>
  );
});
