import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {ScreenOptionType} from '@app/types';

import {WalletConnectApplicationListScreen} from './wallet-connect-application-list';

const WalletConnect = createStackNavigator();

const screenOptions: ScreenOptionType = {
  ...popupScreenOptions,
  headerRight: DismissPopupButton,
  keyboardHandlingEnabled: false,
  headerBackHidden: true,
};

export const WalletConnectApplicationListPopupScreen = () => {
  const route = useTypedRoute<'walletConnectApplicationListPopup'>();
  return (
    <WalletConnect.Navigator screenOptions={screenOptions}>
      <WalletConnect.Screen
        name="walletConnectApplicationListPopupContent"
        component={WalletConnectApplicationListScreen}
        initialParams={{...route.params, isPopup: true}}
      />
    </WalletConnect.Navigator>
  );
};
