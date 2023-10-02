import React, {useCallback, useMemo} from 'react';

import {observer} from 'mobx-react';

import {LockedTokens} from '@app/components/locked-tokens';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {useTypedNavigation, useWalletsVisible} from '@app/hooks';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {calculateBalances} from '@app/utils';

export const LockedTokensWrapper = observer(() => {
  const visible = useWalletsVisible();
  const balances = useWalletsBalance(visible);
  const calculatedBalance = useMemo(
    () => calculateBalances(balances, visible),
    [balances, visible],
  );

  const navigation = useTypedNavigation();

  const onForwardPress = useCallback(
    () => navigation.navigate('totalValueInfo'),
    [navigation],
  );

  if (
    visible.length <= 1 ||
    !isFeatureEnabled(Feature.lockedStakedVestedTokens)
  ) {
    return null;
  }

  return (
    <LockedTokens balance={calculatedBalance} onForwardPress={onForwardPress} />
  );
});
