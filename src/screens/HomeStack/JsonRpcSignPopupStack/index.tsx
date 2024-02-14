import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {popupScreenOptionsWithMargin} from '@app/helpers';
import {themeUpdaterHOC} from '@app/helpers/theme-updater-hoc';
import {useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {
  HomeStackParamList,
  HomeStackRoutes,
  JsonRpcSignPopupStackRoutes,
} from '@app/route-types';
import {JsonRpcSignScreen} from '@app/screens/HomeStack/JsonRpcSignPopupStack/json-rpc-sign-screen';
import {ScreenOptionType} from '@app/types';

const Stack = createNativeStackNavigator();

const screenOptions: ScreenOptionType = {
  ...popupScreenOptionsWithMargin,
  title: getText(I18N.walletConnectSignTitle),
  headerBackHidden: true,
};

export const JsonRpcSignPopupStack = memo(() => {
  const route = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.JsonRpcSign
  >();
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name={JsonRpcSignPopupStackRoutes.JsonRpcSign}
        component={themeUpdaterHOC(JsonRpcSignScreen)}
        initialParams={route.params}
      />
    </Stack.Navigator>
  );
});
