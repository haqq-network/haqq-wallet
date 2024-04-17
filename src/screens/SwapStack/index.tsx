import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {hideBack, hideHeader, popupScreenOptions} from '@app/helpers';
import {themeUpdaterHOC} from '@app/helpers/theme-updater-hoc';
import {useTypedRoute} from '@app/hooks';
import {
  HomeStackParamList,
  HomeStackRoutes,
  SwapStackParamList,
  SwapStackRoutes,
} from '@app/route-types';

import {SwapFinishScreen} from './swap-finish-screen';
import {SwapPreviewScreen} from './swap-preview-screen';
import {SwapScreen} from './swap-screen';

const Stack = createNativeStackNavigator<SwapStackParamList>();

const SwapStack = memo(() => {
  const {params} = useTypedRoute<HomeStackParamList, HomeStackRoutes.Swap>();
  return (
    <Stack.Navigator
      screenOptions={popupScreenOptions}
      initialRouteName={SwapStackRoutes.Swap}>
      <Stack.Screen
        name={SwapStackRoutes.Swap}
        component={themeUpdaterHOC(SwapScreen)}
        options={hideBack}
        initialParams={params}
      />
      <Stack.Screen
        name={SwapStackRoutes.Preview}
        component={themeUpdaterHOC(SwapPreviewScreen)}
        options={hideHeader}
        initialParams={params}
      />
      <Stack.Screen
        name={SwapStackRoutes.Finish}
        component={themeUpdaterHOC(SwapFinishScreen)}
        options={hideHeader}
      />
    </Stack.Navigator>
  );
});

export {SwapStack};
