import React, {useCallback} from 'react';

import {RouteProp, useRoute} from '@react-navigation/native';

import {VisibleAccountSelector} from '@app/components/visible-account-selector';
import {useTypedNavigation} from '@app/hooks';

import {RootStackParamList} from '../types';

export const StakingUnDelegateAccountScreen = () => {
  const navigation = useTypedNavigation();
  const route =
    useRoute<RouteProp<RootStackParamList, 'stakingUnDelegateAccount'>>();

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
    <VisibleAccountSelector
      wallets={route.params.available}
      onPress={onPressRow}
    />
  );
};
