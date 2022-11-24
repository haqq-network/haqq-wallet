import React, {useCallback} from 'react';

import {VisibleAccountSelector} from '@app/components/visible-account-selector';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const StakingUnDelegateAccountScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'stakingUnDelegateAccount'>();

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
