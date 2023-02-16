import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {DismissPopupButton} from '@app/components/dismiss-popup-button';
import {popupScreenOptions} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {WalletConnectApproval} from '@app/screens/wallet-connect-approval';
import {ScreenOptionType} from '@app/types';

const WalletConnect = createStackNavigator();

const screenOptionsAddressRoute: ScreenOptionType = {
  title: getText(I18N.walletConnectTitle),
  headerRight: DismissPopupButton,
};

const screenOptions = {...popupScreenOptions, keyboardHandlingEnabled: false};

export const TransactionScreen = () => {
  return (
    <WalletConnect.Navigator screenOptions={screenOptions}>
      <WalletConnect.Screen
        name="walletConnectApproval"
        component={WalletConnectApproval}
        options={screenOptionsAddressRoute}
      />
    </WalletConnect.Navigator>
  );
};
