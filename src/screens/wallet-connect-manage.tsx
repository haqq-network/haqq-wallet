import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {ScreenOptionType} from '@app/types';

import {WalletConnectApplicationList} from './wallet-connect-application-list';
import {WalletConnectWalletList} from './wallet-connect-wallet-list';

const WalletConnectManage = createStackNavigator();

const screenOptionsWalletList: ScreenOptionType = {
  title: getText(I18N.walletConnectWalletListTitle),
  // headerRight: DismissPopupButton,
};

const screenOptionsApplicationList: ScreenOptionType = {
  title: getText(I18N.walletConnectApplicationListTitle, {account: 'Main'}),
  // headerRight: DismissPopupButton,
};

const screenOptions = {
  headerBackTitle: '',
};

export const WalletConnectManageScreen = () => {
  const route = useTypedRoute<'walletConnect'>();

  return (
    <WalletConnectManage.Navigator screenOptions={screenOptions}>
      <WalletConnectManage.Screen
        name="walletConnectWalletList"
        options={screenOptionsWalletList}
        component={WalletConnectWalletList}
        initialParams={route.params}
      />
      <WalletConnectManage.Screen
        name="walletConnectApplicationList"
        options={screenOptionsApplicationList}
        component={WalletConnectApplicationList}
        initialParams={route.params}
      />
    </WalletConnectManage.Navigator>
  );
};
