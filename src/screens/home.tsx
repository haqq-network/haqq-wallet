import React from 'react';

import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {RouteProp} from '@react-navigation/core/lib/typescript/src/types';

import {Color} from '@app/colors';
import {HomeScreenTabBarIcon} from '@app/components/home-screen/tab-bar-icon';
import {HomeScreenTitle} from '@app/components/home-screen/title';
import {QrScannerButton} from '@app/components/qr-scanner-button';
import {useUser} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {HomeGovernanceScreen} from '@app/screens/home-governance';
import {HomeStakingScreen} from '@app/screens/home-staking';
import {RootStackParamList} from '@app/types';
import {IS_IOS} from '@app/variables/common';

import {HomeFeedScreen} from './home-feed';
import {HomeSettingsScreen} from './home-settings';

const Tab = createBottomTabNavigator();

const screenOptions = ({
  route,
}: {
  route: RouteProp<RootStackParamList>;
  navigation: any;
}): BottomTabNavigationOptions => ({
  headerShadowVisible: false,
  headerStyle: {
    backgroundColor: Color.transparent,
  },
  headerTitleAlign: 'center',
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
  headerTitle: () => <HomeScreenTitle route={route} />,
  tabBarIcon: ({focused}) => (
    <HomeScreenTabBarIcon focused={focused} route={route} />
  ),
});

const feedOptions = {
  title: getText(I18N.homeWallet),
  headerRight: QrScannerButton,
};

const stakingOptions = {
  title: getText(I18N.homeStaking),
  unmountOnBlur: true,
};

const governanceOptions = {
  headerShown: false,
  title: getText(I18N.homeGovernance),
};

const settingsOptions = {
  title: getText(I18N.homeSettings),
};

export const HomeScreen = () => {
  const user = useUser();
  const provider = Provider.getProvider(user.providerId);

  return (
    <Tab.Navigator mode="modal" headerMode="none" screenOptions={screenOptions}>
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
