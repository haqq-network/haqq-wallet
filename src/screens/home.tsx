import React, {useEffect} from 'react';

import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {NavigationAction} from '@react-navigation/routers';
import {TransitionPresets} from '@react-navigation/stack';
import {StatusBar} from 'react-native';

import {Color} from '@app/colors';
import {HomeScreenLabel} from '@app/components/home-screen/label';
import {HomeScreenTabBarIcon} from '@app/components/home-screen/tab-bar-icon';
import {HomeScreenTitle} from '@app/components/home-screen/title';
import {QrScannerButton} from '@app/components/qr-scanner-button';
import {Spacer} from '@app/components/ui';
import {useTypedNavigation} from '@app/hooks';
import {useProvider} from '@app/hooks/use-provider';
import {HomeNewsScreen} from '@app/screens/home-news';
import {IS_IOS} from '@app/variables/common';

import {HomeBrowserScreen} from './home-browser';
import {HomeFeedScreen} from './home-feed';
import {HomeSettingsScreen} from './home-settings';

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
};

const tabBarIcon = (route: string) => (props: {focused: boolean}) => (
  <HomeScreenTabBarIcon focused={props.focused} route={route} />
);

const feedOptions = {
  headerRight: QrScannerButton,
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
};

const settingsOptions = {
  tabBarIcon: tabBarIcon('homeSettings'),
};

const navigationOptions = {
  ...screenOptions,
  unmountOnBlur: true,
};

export const HomeScreen = () => {
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

  return (
    <Tab.Navigator screenOptions={navigationOptions}>
      <Tab.Screen
        name="homeFeed"
        component={HomeFeedScreen}
        options={feedOptions}
      />
      {provider?.ethChainId && provider?.ethChainId !== 11235 && (
        <Tab.Screen
          name="homeBrowser"
          component={HomeBrowserScreen}
          options={browserOptions}
        />
      )}
      <Tab.Screen
        name="homeNews"
        component={HomeNewsScreen}
        options={newsOptions}
      />
      <Tab.Screen
        name="homeSettings"
        component={HomeSettingsScreen}
        options={settingsOptions}
      />
    </Tab.Navigator>
  );
};
