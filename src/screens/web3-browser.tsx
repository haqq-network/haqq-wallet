import React from 'react';

import {Web3Browser} from '@app/components/web3-browser';
import {useTypedRoute} from '@app/hooks';

export const Web3BrowserScreen = () => {
  const {url} = useTypedRoute<'web3browser'>().params;

  return <Web3Browser initialUrl={url} />;
};
