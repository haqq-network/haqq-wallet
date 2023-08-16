import React from 'react';

import {TransitionPresets, createStackNavigator} from '@react-navigation/stack';

import {Spacer} from '@app/components/ui';
import {useTypedRoute} from '@app/hooks';
import {ScreenOptionType} from '@app/types';

import {Web3BrowserScreen} from './HomeStack/BrowserStack/web3-browser';

const Navigator = createStackNavigator();

const screenOptions: ScreenOptionType = {
  keyboardHandlingEnabled: false,
  headerBackHidden: true,
  gestureEnabled: false,
  header: () => <Spacer height={10} />,
};

export const Web3BrowserPopup = () => {
  const route = useTypedRoute<'web3BrowserPopup'>();
  return (
    <Navigator.Navigator screenOptions={screenOptions}>
      <Navigator.Screen
        name="web3BrowserPopupInner"
        component={Web3BrowserScreen}
        options={TransitionPresets.ModalSlideFromBottomIOS}
        initialParams={route.params}
      />
    </Navigator.Navigator>
  );
};
