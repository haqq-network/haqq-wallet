import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HomeFeedScreen} from './home-feed';
import {HomeSettingsScreen} from './home-settings';
import {QrScannerButton} from '../components/qr-scanner-button';
import {HeaderTitleProps} from '@react-navigation/elements';
import {SettingsIcon, WalletIcon, Text} from '../components/ui';
import {GRAPHIC_BASE_2, GRAPHIC_GREEN_1} from '../variables';
import {isIOS} from '../helpers';

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
          height: isIOS ? 80 : 45,
          marginBottom: isIOS ? 0 : 20,
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
            <WalletIcon color={focused ? GRAPHIC_GREEN_1 : GRAPHIC_BASE_2} />
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
            <SettingsIcon color={focused ? GRAPHIC_GREEN_1 : GRAPHIC_BASE_2} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
