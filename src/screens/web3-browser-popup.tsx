import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {Spacer} from '@app/components/ui';
import {useTypedRoute} from '@app/hooks';
import {HomeStackParamList, HomeStackRoutes} from '@app/screens/HomeStack';
import {ScreenOptionType} from '@app/types';

import {Web3BrowserScreen} from './HomeStack/BrowserStack/web3-browser';

const Stack = createNativeStackNavigator();

const screenOptions: ScreenOptionType = {
  headerBackHidden: true,
  gestureEnabled: false,
  header: () => <Spacer height={10} />,
};

export const Web3BrowserPopup = memo(() => {
  const route = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.Web3BrowserPopup
  >();
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="web3BrowserPopupInner"
        component={Web3BrowserScreen}
        initialParams={route.params}
      />
    </Stack.Navigator>
  );
});
