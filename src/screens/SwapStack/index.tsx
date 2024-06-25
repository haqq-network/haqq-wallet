import React, {memo} from 'react';

import {RouteProp} from '@react-navigation/native';
import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import {StackNavigationProp} from '@react-navigation/stack';
import {StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {Spacer} from '@app/components/ui';
import {hideHeader, popupScreenOptions} from '@app/helpers';
import {themeUpdaterHOC} from '@app/helpers/theme-updater-hoc';
import {useTypedRoute} from '@app/hooks';
import {
  HomeStackParamList,
  HomeStackRoutes,
  SwapStackParamList,
  SwapStackRoutes,
} from '@app/route-types';
import {IS_IOS} from '@app/variables/common';

import {SwapFinishScreen} from './swap-finish-screen';
import {SwapPreviewScreen} from './swap-preview-screen';
import {SwapScreen} from './swap-screen';

type RouteOptions =
  | NativeStackNavigationOptions
  | ((props: {
      route: RouteProp<SwapStackParamList, SwapStackRoutes>;
      navigation: StackNavigationProp<SwapStackParamList, SwapStackRoutes>;
    }) => NativeStackNavigationOptions);

const Stack = createNativeStackNavigator<SwapStackParamList>();

export const SwapStacScreenParams: Record<SwapStackRoutes, RouteOptions> = {
  [SwapStackRoutes.Swap]: {
    header: () =>
      IS_IOS ? (
        <Spacer height={StatusBar.currentHeight} />
      ) : (
        <SafeAreaView edges={['top']} />
      ),
  },
  [SwapStackRoutes.Preview]: hideHeader,
  [SwapStackRoutes.Finish]: hideHeader,
};

const SwapStack = memo(() => {
  const {params} = useTypedRoute<HomeStackParamList, HomeStackRoutes.Swap>();
  return (
    <Stack.Navigator
      screenOptions={popupScreenOptions}
      initialRouteName={SwapStackRoutes.Swap}>
      <Stack.Screen
        name={SwapStackRoutes.Swap}
        component={themeUpdaterHOC(SwapScreen)}
        options={SwapStacScreenParams[SwapStackRoutes.Swap]}
        initialParams={params}
      />
      <Stack.Screen
        name={SwapStackRoutes.Preview}
        component={themeUpdaterHOC(SwapPreviewScreen)}
        options={SwapStacScreenParams[SwapStackRoutes.Preview]}
        initialParams={params}
      />
      <Stack.Screen
        name={SwapStackRoutes.Finish}
        component={themeUpdaterHOC(SwapFinishScreen)}
        options={SwapStacScreenParams[SwapStackRoutes.Finish]}
      />
    </Stack.Navigator>
  );
});

export {SwapStack};
