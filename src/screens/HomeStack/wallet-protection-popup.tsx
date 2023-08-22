import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {SpacerPopupButton} from '@app/components/popup/spacer-popup-button';
import {popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {HomeStackParamList, HomeStackRoutes} from '@app/screens/HomeStack';

import {WalletProtectionScreen} from '../wallet-protection';

const Stack = createNativeStackNavigator();

const screenOptions = {
  ...popupScreenOptions,
  headerLeft: SpacerPopupButton,
  headerRight: DismissPopupButton,
  headerBackHidden: true,
};

export const WalletProtectionPopupScreen = memo(() => {
  const route = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.WalletProtectionPopup
  >();
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="walletProtection"
        component={WalletProtectionScreen}
        initialParams={route.params}
      />
    </Stack.Navigator>
  );
});
