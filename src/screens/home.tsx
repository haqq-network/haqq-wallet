import React from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HomeFeedScreen} from './home-feed';
import {HomeSettingsScreen} from './home-settings';
import {HomeMarketScreen} from './home-market';
import {HomeSwapScreen} from './home-swap';
import {QrScannerButton} from '../components/qr-scanner-button';
import {TabHeader} from '../components/tab-header';
import {MarketIcon, SettingsIcon, SwapIcon, WalletIcon} from '../components/ui';
import {GRAPHIC_BASE_2, GRAPHIC_GREEN_1} from '../variables';

type HomeScreenProp = CompositeScreenProps<any, any>;
const Tab = createBottomTabNavigator();
export const HomeScreen = ({}: HomeScreenProp) => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerTitle: TabHeader,
        headerStyle: {
          backgroundColor: 'transparent',
        },
      }}>
      <Tab.Screen
        name="home-feed"
        component={HomeFeedScreen}
        options={{
          title: 'Wallet',
          headerTitle: 'Your wallets',
          headerRight: () => <QrScannerButton />,
          tabBarIcon: ({focused}) => (
            <WalletIcon color={focused ? GRAPHIC_GREEN_1 : GRAPHIC_BASE_2} />
          ),
        }}
      />
      <Tab.Screen
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
      />
      <Tab.Screen
        name="home-settings"
        component={HomeSettingsScreen}
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
          tabBarIcon: ({focused}) => (
            <SettingsIcon color={focused ? GRAPHIC_GREEN_1 : GRAPHIC_BASE_2} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
