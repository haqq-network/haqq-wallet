import React from 'react';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HeaderTitleProps} from '@react-navigation/elements';

import {HomeFeedScreen} from './home-feed';
import {HomeSettingsScreen} from './home-settings';

import {QrScannerButton} from '../components/qr-scanner-button';
import {SettingsIcon, Text, WalletIcon} from '../components/ui';
import {
  IS_IOS,
  LIGHT_GRAPHIC_BASE_2,
  LIGHT_GRAPHIC_GREEN_1,
} from '../variables';

const Tab = createBottomTabNavigator();

interface HeaderTitleT extends HeaderTitleProps {
  headerTitle?: string;
}

export const HomeScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerTitle: ({headerTitle}: HeaderTitleT) => (
          <Text t8>{headerTitle}</Text>
        ),
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: 'transparent',
        },
        tabBarStyle: {
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
      }}>
      <Tab.Screen
        name="home-feed"
        component={HomeFeedScreen}
        options={{
          title: 'Wallet',
          headerTitle: 'Your wallets',
          headerTitleAlign: 'center',
          headerRight: () => <QrScannerButton />,
          headerTitleAllowFontScaling: false,
          tabBarIcon: ({focused}) => (
            <WalletIcon
              color={focused ? LIGHT_GRAPHIC_GREEN_1 : LIGHT_GRAPHIC_BASE_2}
            />
          ),
          headerTitleStyle: {
            fontSize: 18,
          },
        }}
      />
      {/* <Tab.Screen
        name="home-market"
        component={HomeMarketScreen}
        options={{
          title: 'Market',
          headerTitle: 'Market screen',
          tabBarIcon: ({focused}) => (
            <MarketIcon color={focused ? GRAPHIC_GREEN_1 : GRAPHIC_BASE_2} />
          ),
        }}
      />
      <Tab.Screen
        name="home-swap"
        component={HomeSwapScreen}
        options={{
          title: 'Swap',
          headerTitle: 'Swap screen',
          tabBarIcon: ({focused}) => (
            <SwapIcon color={focused ? GRAPHIC_GREEN_1 : GRAPHIC_BASE_2} />
          ),
        }}
      /> */}
      <Tab.Screen
        name="home-settings"
        component={HomeSettingsScreen}
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
          headerTitleAllowFontScaling: false,
          headerTitleAlign: 'center',
          tabBarIcon: ({focused}) => (
            <SettingsIcon
              color={focused ? LIGHT_GRAPHIC_GREEN_1 : LIGHT_GRAPHIC_BASE_2}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
