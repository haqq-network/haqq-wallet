import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {HomeStackParamList, HomeStackRoutes} from '@app/screens/HomeStack';
import {ScreenOptionType} from '@app/types';

import {WalletConnectApplicationDetailsScreen} from './wallet-connect-application-details';

const Stack = createNativeStackNavigator();

const screenOptions: ScreenOptionType = {
  ...popupScreenOptions,
  headerRight: DismissPopupButton,
};

export const WalletConnectApplicationDetailsPopupScreen = memo(() => {
  const route = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.WalletConnectApplicationDetailsPopup
  >();
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="walletConnectApplicationDetailsPopupContent"
        component={WalletConnectApplicationDetailsScreen}
        initialParams={{...route.params, isPopup: true}}
      />
    </Stack.Navigator>
  );
});
