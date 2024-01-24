import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {popupScreenOptions} from '@app/helpers';
import {themeUpdaterHOC} from '@app/helpers/theme-updater-hoc';
import {useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {
  HomeStackParamList,
  HomeStackRoutes,
  WalletConnectApprovalStackParamList,
  WalletConnectApprovalStackRoutes,
} from '@app/route-types';
import {WalletConnectApprovalScreen} from '@app/screens/HomeStack/WalletConnectApprovalStack/wallet-connect-approval';
import {ScreenOptionType} from '@app/types';

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
        component={themeUpdaterHOC(WalletConnectApprovalScreen)}
        options={screenOptionsApprovalScreen}
        initialParams={route.params.params}
      />
    </Stack.Navigator>
  );
};
