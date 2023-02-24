import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {DismissPopupButton} from '@app/components/dismiss-popup-button';
import {popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {ScreenOptionType} from '@app/types';

import {WalletConnectApplicationList} from './wallet-connect-application-list';

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
        component={WalletConnectApplicationList}
        initialParams={{...route.params, isPopup: true}}
      />
    </WalletConnect.Navigator>
  );
};
