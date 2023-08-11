import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {themeUpdaterHOC} from '@app/helpers/theme-updater-hoc';
import {basicScreenOptions} from '@app/screens';
import {HomeScreen} from '@app/screens/HomeStack/home';
import {RootStackParamList} from '@app/types';

export enum HomeStackRoutes {
  Home = 'home',
}

export type HomeStackParamList = {
  [HomeStackRoutes.Home]: RootStackParamList[HomeStackRoutes.Home];
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack = memo(() => {
  return (
    <Stack.Navigator initialRouteName={HomeStackRoutes.Home}>
      <Stack.Screen
        component={themeUpdaterHOC(HomeScreen)}
        name={HomeStackRoutes.Home}
        options={basicScreenOptions}
      />
    </Stack.Navigator>
  );
});

export {HomeStack};
