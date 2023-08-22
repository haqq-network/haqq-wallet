import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {HomeStackParamList, HomeStackRoutes} from '@app/screens/HomeStack';
import {WalletConnectApprovalScreen} from '@app/screens/HomeStack/WalletConnectApprovalStack/wallet-connect-approval';
import {ScreenOptionType} from '@app/types';
import {WalletConnectApproveConnectionEvent} from '@app/types/wallet-connect';

export enum WalletConnectApprovalStackRoutes {
  WalletConnectApproval = 'walletConnectApproval',
}

export type WalletConnectApprovalStackParamList = {
  [WalletConnectApprovalStackRoutes.WalletConnectApproval]: {
    event: WalletConnectApproveConnectionEvent;
  };
};

const Stack = createNativeStackNavigator<WalletConnectApprovalStackParamList>();

const screenOptionsApprovalScreen: ScreenOptionType = {
  title: getText(I18N.walletConnectTitle),
  headerRight: DismissPopupButton,
};

const screenOptions: ScreenOptionType = {
  ...popupScreenOptions,
  headerBackHidden: true,
};

export const WalletConnectApprovalStack = () => {
  const route = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.WalletConnect
  >();
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name={WalletConnectApprovalStackRoutes.WalletConnectApproval}
        component={WalletConnectApprovalScreen}
        options={screenOptionsApprovalScreen}
        initialParams={route.params.params}
      />
    </Stack.Navigator>
  );
};
