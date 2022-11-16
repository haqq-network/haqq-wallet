import React, {useEffect, useRef} from 'react';

import {View} from 'react-native';

import {app} from '@app/contexts';
// import {useWallets} from '@app/hooks';
import {Cosmos} from '@app/services/cosmos';
//0x6e03A60fdf8954B4c10695292Baf5C4bdC34584B
export const SettingsTestScreen = () => {
  const cosmos = useRef(new Cosmos(app.provider!)).current;
  // const wallets = useWallets();

  useEffect(() => {
    const address = Cosmos.address(
      '0x6e03A60fdf8954B4c10695292Baf5C4bdC34584B',
    );

    cosmos
      .getAccountDelegations(address)
      .then(resp => resp.json())
      .then(resp => {
        console.log(resp);
      })
      .catch(e => {
        console.log('e', e);
      });
  }, [cosmos]);

  return <View />;
};
