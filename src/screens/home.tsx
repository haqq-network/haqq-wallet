import React from 'react';

import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {TransitionPresets} from '@react-navigation/stack';

import {Color} from '@app/colors';
import {HomeScreenLabel} from '@app/components/home-screen/label';
import {HomeScreenTabBarIcon} from '@app/components/home-screen/tab-bar-icon';
import {HomeScreenTitle} from '@app/components/home-screen/title';
import {QrScannerButton} from '@app/components/qr-scanner-button';
import {useUser} from '@app/hooks';
import {Provider} from '@app/models/provider';
import {HomeGovernanceScreen} from '@app/screens/home-governance';
import {HomeStakingScreen} from '@app/screens/home-staking';
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
  headerStatusBarHeight: IS_IOS ? undefined : 0,
  tabBarStyle: {
    backgroundColor: Color.transparent,
    borderTopWidth: 0,
    elevation: 0,
    height: IS_IOS ? 80 : 50,
    top: IS_IOS ? 0 : 8,
    marginBottom: IS_IOS ? 0 : 23,
  },
  tabBarItemStyle: {
    marginTop: IS_IOS ? 5 : 8,
    height: IS_IOS ? 50 : 40,
  },
  headerTitle: ({children}) => <HomeScreenTitle route={children} />,
  tabBarLabel: ({children, focused}) => (
    <HomeScreenLabel focused={focused} route={children} />
  ),
};

const tabBarIcon = (route: string) => (props: {focused: boolean}) =>
  <HomeScreenTabBarIcon focused={props.focused} route={route} />;

const feedOptions = {
  headerRight: QrScannerButton,
  tabBarIcon: tabBarIcon('homeFeed'),
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

const governanceOptions = {
  headerShown: false,
  tabBarIcon: tabBarIcon('homeGovernance'),
};

const settingsOptions = {
  tabBarIcon: tabBarIcon('homeSettings'),
};

export const HomeScreen = () => {
  const user = useUser();
  const provider = Provider.getProvider(user.providerId);

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="homeFeed"
        component={HomeFeedScreen}
        options={feedOptions}
      />
      {provider?.ethChainId && provider?.ethChainId !== 11235 && (
        <Tab.Screen
          name="homeStaking"
          component={HomeStakingScreen}
          options={stakingOptions}
        />
      )}
      {user.isDeveloper && (
        <Tab.Screen
          name="homeBrowser"
          component={HomeBrowserScreen}
          options={browserOptions}
        />
      )}
      {provider?.ethChainId && provider?.ethChainId !== 11235 && (
        <Tab.Screen
          name="homeGovernance"
          component={HomeGovernanceScreen}
          options={governanceOptions}
        />
      )}
      <Tab.Screen
        name="homeSettings"
        component={HomeSettingsScreen}
        options={settingsOptions}
      />
    </Tab.Navigator>
  );
};
