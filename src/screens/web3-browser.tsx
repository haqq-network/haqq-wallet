import React, {useCallback} from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {DismissPopupButton} from '@app/components/dismiss-popup-button';
import {Web3Browser} from '@app/components/web3-browser';
import {popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {ScreenOptionType} from '@app/types';

const Web3BrowserNavigator = createStackNavigator();

const screenOptions: ScreenOptionType = {
  ...popupScreenOptions,
  keyboardHandlingEnabled: false,
  headerBackHidden: true,
  headerRight: DismissPopupButton,
};

export const Web3BrowserScreen = () => {
  const {url} = useTypedRoute<'web3browser'>().params;
  // return <Web3Browser initialUrl={'https://app.haqq.network/'} />;
  // return <Web3Browser initialUrl={'https://app.uniswap.org'} />;

  const BrowserTab = useCallback(() => <Web3Browser initialUrl={url} />, [url]);

  return (
    <Web3BrowserNavigator.Navigator screenOptions={screenOptions}>
      <Web3BrowserNavigator.Screen
        name="walletConnectApproval"
        options={screenOptions}
        component={BrowserTab}
      />
    </Web3BrowserNavigator.Navigator>
  );
};
