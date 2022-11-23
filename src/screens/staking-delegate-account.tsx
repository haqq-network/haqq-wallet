import React, {useCallback} from 'react';

import {RouteProp, useRoute} from '@react-navigation/native';

import {StakingDelegateAccount} from '@app/components/staking-delegate-account';
import {useTypedNavigation, useWallets} from '@app/hooks';

import {RootStackParamList} from '../types';

export const StakingDelegateAccountScreen = () => {
  const navigation = useTypedNavigation();
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

  return (
    <StakingDelegateAccount wallets={wallets.visible} onPress={onPressRow} />
  );
};
