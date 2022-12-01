import React, {useCallback} from 'react';

import {VisibleAccountSelector} from '@app/components/visible-account-selector';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const StakingUnDelegateAccountScreen = () => {
  const navigation = useTypedNavigation();
  const params = useTypedRoute<'stakingUnDelegateAccount'>().params;

  const onPressRow = useCallback(
    (address: string) => {
      navigation.navigate('stakingUnDelegateForm', {
        ...params,
        account: address,
      });
    },
    [navigation, params],
  );

  return (
    <VisibleAccountSelector wallets={params.available} onPress={onPressRow} />
  );
};
