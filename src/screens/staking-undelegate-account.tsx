import React, {useCallback} from 'react';

import {RouteProp, useRoute} from '@react-navigation/native';

import {VisibleAccountSelector} from '@app/components/visible-account-selector';
import {useTypedNavigation, useWallets} from '@app/hooks';

import {RootStackParamList} from '../types';

export const StakingUnDelegateAccountScreen = () => {
  const navigation = useTypedNavigation();
  const route =
    useRoute<RouteProp<RootStackParamList, 'stakingUnDelegateAccount'>>();
  const wallets = useWallets();
  const onPressRow = useCallback(
    (address: string) => {
      navigation.navigate('stakingUnDelegateForm', {
        ...route.params,
        account: address,
      });
    },
    [navigation, route.params],
  );

  return (
    <VisibleAccountSelector wallets={wallets.visible} onPress={onPressRow} />
  );
};
