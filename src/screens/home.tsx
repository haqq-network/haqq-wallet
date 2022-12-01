import React from 'react';

import {IS_DEVELOPMENT} from '@env';
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {RouteProp} from '@react-navigation/core/lib/typescript/src/types';

import {Color} from '@app/colors';
import {HomeScreenTabBarIcon} from '@app/components/home-screen/tab-bar-icon';
import {HomeScreenTitle} from '@app/components/home-screen/title';
import {QrScannerButton} from '@app/components/qr-scanner-button';
import {I18N, getText} from '@app/i18n';
import {HomeGovernanceScreen} from '@app/screens/home-governance';
import {HomeStakingScreen} from '@app/screens/home-staking';
import {RootStackParamList} from '@app/types';
import {IS_IOS} from '@app/variables';

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

export const HomeScreen = () => {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="homeFeed"
        component={HomeFeedScreen}
        options={{
          title: getText(I18N.homeWallet),
          headerRight: QrScannerButton,
        }}
      />
      {IS_DEVELOPMENT === '1' && (
        <Tab.Screen
          name="homeStaking"
          component={HomeStakingScreen}
          options={{
            title: getText(I18N.homeStaking),
          }}
        />
      )}
      {IS_DEVELOPMENT === '1' && (
        <Tab.Screen
          name="homeGovernance"
          component={HomeGovernanceScreen}
          options={{
            title: getText(I18N.homeGovernance),
          }}
        />
      )}
      <Tab.Screen
        name="homeSettings"
        component={HomeSettingsScreen}
        options={{
          title: getText(I18N.homeSettings),
        }}
      />
    </Tab.Navigator>
  );
};
