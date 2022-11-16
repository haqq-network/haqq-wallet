import React from 'react';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HeaderTitleProps} from '@react-navigation/elements';

import {Color, getColor} from '@app/colors';
import {QrScannerButton} from '@app/components/qr-scanner-button';
import {Icon, Text} from '@app/components/ui';
import {I18N, getText} from '@app/i18n';
import {IS_IOS} from '@app/variables';

import {HomeFeedScreen} from './home-feed';
import {HomeSettingsScreen} from './home-settings';

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
    height: IS_IOS ? 80 : 50,
    top: IS_IOS ? 0 : 8,
    marginBottom: IS_IOS ? 0 : 23,
  },
  tabBarItemStyle: {
    marginTop: IS_IOS ? 5 : 8,
    height: IS_IOS ? 50 : 40,
  },
};

export const HomeScreen = () => {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="home-feed"
        component={HomeFeedScreen}
        options={{
          title: getText(I18N.homeWallet),
          headerTitle: () => <Text t8>{getText(I18N.homeWalletTitle)}</Text>,
          headerRight: () => <QrScannerButton />,
          tabBarIcon: ({focused}) => (
            <Icon
              s
              name="wallet"
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
          title: getText(I18N.homeSettings),
          headerTitle: () => <Text t8>{getText(I18N.homeSettingsTitle)}</Text>,
          tabBarIcon: ({focused}) => (
            <Icon
              s
              name="settings"
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
