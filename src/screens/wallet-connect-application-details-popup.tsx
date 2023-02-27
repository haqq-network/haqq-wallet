import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {DismissPopupButton} from '@app/components/dismiss-popup-button';
import {popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {ScreenOptionType} from '@app/types';

import {WalletConnectApplicationDetails} from './wallet-connect-application-details';

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
        component={WalletConnectApplicationDetails}
        initialParams={{...route.params, isPopup: true}}
      />
    </WalletConnect.Navigator>
  );
};
