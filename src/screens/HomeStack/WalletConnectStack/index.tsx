import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {popupScreenOptionsWithMargin} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {
  WalletConnectStackParamList,
  WalletConnectStackRoutes,
} from '@app/route-types';
import {basicScreenOptions} from '@app/screens';
import {WalletConnectApplicationDetailsScreen} from '@app/screens/HomeStack/WalletConnectStack/wallet-connect-application-details';
import {WalletConnectApplicationListScreen} from '@app/screens/HomeStack/WalletConnectStack/wallet-connect-application-list';
import {WalletConnectWalletListScreen} from '@app/screens/HomeStack/WalletConnectStack/wallet-connect-wallet-list';

const Stack = createNativeStackNavigator<WalletConnectStackParamList>();

const WalletConnectStack = memo(() => {
  return (
    <Stack.Navigator
      initialRouteName={WalletConnectStackRoutes.WalletConnectWalletList}
      screenOptions={basicScreenOptions}>
      <Stack.Screen
        name={WalletConnectStackRoutes.WalletConnectWalletList}
        component={WalletConnectWalletListScreen}
        options={{
          ...popupScreenOptionsWithMargin,
          title: getText(I18N.walletConnectWalletListTitle),
          headerShown: true,
        }}
      />
      <Stack.Screen
        name={WalletConnectStackRoutes.WalletConnectApplicationDetails}
        component={WalletConnectApplicationDetailsScreen}
        options={{
          ...popupScreenOptionsWithMargin,
          title: '',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name={WalletConnectStackRoutes.WalletConnectApplicationList}
        component={WalletConnectApplicationListScreen}
        options={{
          ...popupScreenOptionsWithMargin,
          title: '',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
});

export {WalletConnectStack};
