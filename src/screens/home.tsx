import React from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HomeFeedScreen} from './home-feed';
import {HomeSettingsScreen} from './home-settings';
import {HomeMarketScreen} from './home-market';
import {HomeSwapScreen} from './home-swap';
import {QrScannerButton} from '../components/qr-scanner-button';
import {H3} from '../components/ui';

type HomeScreenProp = CompositeScreenProps<any, any>;
const Tab = createBottomTabNavigator();
export const HomeScreen = ({}: HomeScreenProp) => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerTitle: props => <H3>{props.headerTitle}</H3>,
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
        options={{title: 'Market'}}
      />
      <Tab.Screen
        name="home-swap"
        component={HomeSwapScreen}
        options={{title: 'Swap'}}
      />
      <Tab.Screen
        name="home-settings"
        component={HomeSettingsScreen}
        options={{title: 'Settings'}}
      />
    </Tab.Navigator>
  );
};
