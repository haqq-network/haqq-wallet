import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {WalletConnectApprovalScreen} from '@app/screens/wallet-connect-approval';
import {ScreenOptionType} from '@app/types';

const WalletConnect = createStackNavigator();

const screenOptionsApprovalScreen: ScreenOptionType = {
  title: getText(I18N.walletConnectTitle),
  headerRight: DismissPopupButton,
};

const screenOptions: ScreenOptionType = {
  ...popupScreenOptions,
  keyboardHandlingEnabled: false,
  headerBackHidden: true,
};

export const WalletConnectScreen = () => {
  const route = useTypedRoute<'walletConnect'>();
  return (
    <WalletConnect.Navigator screenOptions={screenOptions}>
      <WalletConnect.Screen
        name="walletConnectApproval"
        component={WalletConnectApprovalScreen}
        options={screenOptionsApprovalScreen}
        initialParams={route.params}
      />
    </WalletConnect.Navigator>
  );
};
