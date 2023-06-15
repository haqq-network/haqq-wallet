import React from 'react';

import {TransitionPresets, createStackNavigator} from '@react-navigation/stack';

import {Spacer} from '@app/components/ui';
import {useTypedRoute} from '@app/hooks';
import {ScreenOptionType} from '@app/types';

import {Web3BrowserScreen} from './web3-browser';

const WalletProtection = createStackNavigator();

const screenOptions: ScreenOptionType = {
  keyboardHandlingEnabled: false,
  headerBackHidden: true,
  gestureEnabled: false,
  header: () => <Spacer height={10} />,
};

export const Web3BrowserPopup = () => {
  const route = useTypedRoute<'web3BrowserPopup'>();
  return (
    <WalletProtection.Navigator screenOptions={screenOptions}>
      <WalletProtection.Screen
        name="web3BrowserPopup"
        component={Web3BrowserScreen}
        options={TransitionPresets.ModalSlideFromBottomIOS}
        initialParams={route.params}
      />
    </WalletProtection.Navigator>
  );
};
