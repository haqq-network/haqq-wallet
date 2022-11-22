import React, {useCallback, useEffect, useState} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {StakingDelegateAccount} from '@app/components/staking-delegate-account';
import {useWallets} from '@app/hooks';

import {RootStackParamList} from '../types';

export const StakingDelegateAccountScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'stakingDelegateAccount'>>();
  const wallets = useWallets();
  const onPressRow = useCallback(
    (address: string) => {
      navigation.navigate('stakingDelegateForm', {
        ...route.params,
        account: address,
      });
    },
    [navigation, route.params],
  );

  const [rows, setRows] = useState(wallets.visible);

  useEffect(() => {
    setRows(wallets.visible);

    const callback = () => {
      setRows(wallets.visible);
    };

    wallets.on('wallets', callback);
    return () => {
      wallets.off('wallets', callback);
    };
  }, [wallets]);

  return <StakingDelegateAccount wallets={rows} onPress={onPressRow} />;
};
