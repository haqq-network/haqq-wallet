import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {HomeStackParamList, HomeStackRoutes} from '@app/screens/HomeStack';
import {ScreenOptionType} from '@app/types';

import {WalletConnectApplicationListScreen} from './wallet-connect-application-list';

const Stack = createNativeStackNavigator();

const screenOptions: ScreenOptionType = {
  ...popupScreenOptions,
  headerRight: DismissPopupButton,
  headerBackHidden: true,
};

export const WalletConnectApplicationListPopupScreen = memo(() => {
  const route = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.WalletConnectApplicationListPopup
  >();
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="walletConnectApplicationListPopupContent"
        component={WalletConnectApplicationListScreen}
        initialParams={{...route.params, isPopup: true}}
      />
    </Stack.Navigator>
  );
});
