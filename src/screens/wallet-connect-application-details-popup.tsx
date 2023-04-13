import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {ScreenOptionType} from '@app/types';

import {WalletConnectApplicationDetailsScreen} from './wallet-connect-application-details';

const WalletConnect = createStackNavigator();

const screenOptions: ScreenOptionType = {
  ...popupScreenOptions,
  headerRight: DismissPopupButton,
  keyboardHandlingEnabled: false,
};

export const WalletConnectApplicationDetailsPopupScreen = () => {
  const route = useTypedRoute<'walletConnectApplicationDetailsPopup'>();
  return (
    <WalletConnect.Navigator screenOptions={screenOptions}>
      <WalletConnect.Screen
        name="walletConnectApplicationDetailsPopupContent"
        component={WalletConnectApplicationDetailsScreen}
        initialParams={{...route.params, isPopup: true}}
      />
    </WalletConnect.Navigator>
  );
};
