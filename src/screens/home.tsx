import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HomeFeedScreen} from './home-feed';
import {HomeSettingsScreen} from './home-settings';
import {QrScannerButton} from '../components/qr-scanner-button';
import {TabHeader} from '../components/tab-header';
import {SettingsIcon, WalletIcon} from '../components/ui';
import {GRAPHIC_BASE_2, GRAPHIC_GREEN_1} from '../variables';

const Tab = createBottomTabNavigator();

export const HomeScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerTitle: TabHeader,
        headerStyle: {
          backgroundColor: 'transparent',
        },
        tabBarStyle: {
          borderTopColor: 'transparent',
        },
      }}>
      <Tab.Screen
        name="home-feed"
        component={HomeFeedScreen}
        options={{
          title: 'Wallet',
          headerTitle: 'Your wallets',
          headerRight: () => <QrScannerButton />,
          headerTitleAllowFontScaling: false,
          tabBarIcon: ({focused}) => (
            <WalletIcon color={focused ? GRAPHIC_GREEN_1 : GRAPHIC_BASE_2} />
          ),
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
          tabBarIcon: ({focused}) => (
            <SettingsIcon color={focused ? GRAPHIC_GREEN_1 : GRAPHIC_BASE_2} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
