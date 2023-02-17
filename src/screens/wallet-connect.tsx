import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {DismissPopupButton} from '@app/components/dismiss-popup-button';
import {popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {WalletConnectApprovalScreen} from '@app/screens/wallet-connect-approval';
import {WalletConnectSignScreen} from '@app/screens/wallet-connect-sign';
import {ScreenOptionType} from '@app/types';

const WalletConnect = createStackNavigator();

const screenOptionsAddressRoute: ScreenOptionType = {
  title: getText(I18N.walletConnectTitle),
  headerRight: DismissPopupButton,
};

const screenOptions = {...popupScreenOptions, keyboardHandlingEnabled: false};

export const WalletConnectScreen = () => {
  const route = useTypedRoute<'walletConnect'>();
  return (
    <WalletConnect.Navigator screenOptions={screenOptions}>
      <WalletConnect.Screen
        name="walletConnectApproval"
        component={WalletConnectApprovalScreen}
        options={screenOptionsAddressRoute}
        initialParams={route.params}
      />
      <WalletConnect.Screen
        name="walletConnectSign"
        component={WalletConnectSignScreen}
        options={screenOptionsAddressRoute}
        initialParams={route.params}
      />
    </WalletConnect.Navigator>
  );
};
