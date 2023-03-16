import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {DismissPopupButton} from '@app/components/dismiss-popup-button';
import {popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {ScreenOptionType} from '@app/types';

import {WalletProtectionScreen} from './wallet-protection';

const WalletProtection = createStackNavigator();

const screenOptions: ScreenOptionType = {
  ...popupScreenOptions,
  headerRight: DismissPopupButton,
  keyboardHandlingEnabled: false,
  headerBackHidden: true,
};

export const WalletProtectionPopup = () => {
  const route = useTypedRoute<'walletProtectionPopup'>();
  return (
    <WalletProtection.Navigator screenOptions={screenOptions}>
      <WalletProtection.Screen
        name="walletProtection"
        component={WalletProtectionScreen}
        initialParams={route.params}
      />
    </WalletProtection.Navigator>
  );
};
