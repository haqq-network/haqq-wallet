import React from 'react';
import { CompositeScreenProps } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeFeedScreen } from './home-feed';
import { HomeSettingsScreen } from './home-settings';
import { HomeMarketScreen } from './home-market';
import { HomeSwapScreen } from './home-swap';
import { QrScannerButton } from '../components/qr-scanner-button';
import { TabHeader } from '../components/tab-header';

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
        }}
      />
      <Tab.Screen
        name="home-market"
        component={HomeMarketScreen}
        options={{ title: 'Market', headerTitle: 'Market screen' }}
      />
      <Tab.Screen
        name="home-swap"
        component={HomeSwapScreen}
        options={{ title: 'Swap', headerTitle: 'Swap screen' }}
      />
      <Tab.Screen
        name="home-settings"
        component={HomeSettingsScreen}
        options={{ title: 'Settings', headerTitle: 'Settings' }}
      />
    </Tab.Navigator>
  );
};
