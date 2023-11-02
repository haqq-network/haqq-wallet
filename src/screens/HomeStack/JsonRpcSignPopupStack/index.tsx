import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {HomeStackParamList, HomeStackRoutes} from '@app/screens/HomeStack';
import {JsonRpcSignScreen} from '@app/screens/HomeStack/JsonRpcSignPopupStack/json-rpc-sign-screen';
import {
  JsonRpcMetadata,
  PartialJsonRpcRequest,
  ScreenOptionType,
} from '@app/types';

export enum JsonRpcSignPopupStackRoutes {
  JsonRpcSign = 'jsonRpcSignScreen',
}

export type JsonRpcSignPopupStackParamList = HomeStackParamList & {
  [JsonRpcSignPopupStackRoutes.JsonRpcSign]: {
    request: PartialJsonRpcRequest;
    metadata: JsonRpcMetadata;
    chainId?: number;
    selectedAccount?: string;
  };
};

const Stack = createNativeStackNavigator();

const screenOptions: ScreenOptionType = {
  ...popupScreenOptions,
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
        component={JsonRpcSignScreen}
        initialParams={route.params}
      />
    </Stack.Navigator>
  );
});
