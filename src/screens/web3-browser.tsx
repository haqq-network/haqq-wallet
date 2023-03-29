import React, {useCallback} from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {DismissPopupButton} from '@app/components/dismiss-popup-button';
import {Web3Browser} from '@app/components/web3-browser';
import {useTypedRoute} from '@app/hooks';

export const Web3BrowserScreen = () => {
  const {url} = useTypedRoute<'web3browser'>().params;

  return <Web3Browser initialUrl={url} />;
};
