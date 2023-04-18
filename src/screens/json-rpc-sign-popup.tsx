import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {JsonRpcSignScreen} from '@app/screens/json-rpc-sign-screen';
import {ScreenOptionType} from '@app/types';

const Navigator = createStackNavigator();

const screenOptions: ScreenOptionType = {
  ...popupScreenOptions,
  title: getText(I18N.walletConnectSignTitle),
  keyboardHandlingEnabled: false,
  headerBackHidden: true,
};

export const JsonRpcSignPopup = () => {
  const route = useTypedRoute<'jsonRpcSign'>();
  return (
    <Navigator.Navigator screenOptions={screenOptions}>
      <Navigator.Screen
        name="jsonRpcSignScreen"
        component={JsonRpcSignScreen}
        initialParams={route.params}
      />
    </Navigator.Navigator>
  );
};
