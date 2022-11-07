import React from 'react';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HeaderTitleProps} from '@react-navigation/elements';

import {HomeFeedScreen} from './home-feed';
import {HomeSettingsScreen} from './home-settings';

import {Color, getColor} from '../colors';
import {QrScannerButton} from '../components/qr-scanner-button';
import {SettingsIcon, Text, WalletIcon} from '../components/ui';
import {isIOS} from '../helpers';

const Tab = createBottomTabNavigator();

interface HeaderTitleT extends HeaderTitleProps {
  headerTitle?: string;
}

const screenOptions = {
  headerTitle: ({headerTitle}: HeaderTitleT) => <Text t8>{headerTitle}</Text>,
  headerShadowVisible: false,
  headerStyle: {
    backgroundColor: Color.transparent,
  },
  tabBarStyle: {
    backgroundColor: Color.transparent,
    borderTopWidth: 0,
    elevation: 0,
    height: isIOS ? 80 : 50,
    top: isIOS ? 0 : 8,
    marginBottom: isIOS ? 0 : 23,
  },
  tabBarItemStyle: {
    marginTop: isIOS ? 5 : 8,
    height: isIOS ? 50 : 40,
  },
};

export const HomeScreen = () => {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="home-feed"
        component={HomeFeedScreen}
        options={{
          title: 'Wallet',
          headerTitle: () => <Text t8>Your wallets</Text>,
          headerRight: () => <QrScannerButton />,
          tabBarIcon: ({focused}) => (
            <WalletIcon
              color={getColor(
                focused ? Color.graphicGreen1 : Color.graphicBase2,
              )}
            />
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
          headerTitle: () => <Text t8>Settings</Text>,
          tabBarIcon: ({focused}) => (
            <SettingsIcon
              color={getColor(
                focused ? Color.graphicGreen1 : Color.graphicBase2,
              )}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
