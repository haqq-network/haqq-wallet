import React, {useCallback, useMemo} from 'react';

import {LockedTokens} from '@app/components/locked-tokens';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {useTypedNavigation, useWalletsVisible} from '@app/hooks';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {useWalletsStakingBalance} from '@app/hooks/use-wallets-staking-balance';
import {Balance} from '@app/services/balance';

export function LockedTokensWrapper() {
  const visible = useWalletsVisible();
  const balances = useWalletsBalance(visible);
  const stakingBalances = useWalletsStakingBalance(visible);
  const navigation = useTypedNavigation();
  const availableBalance = useMemo(
    () =>
      Object.values(balances).reduce(
        (prev, curr) => prev?.operate(curr, 'add'),
        Balance.Empty,
      ) ?? Balance.Empty,
    [balances],
  );

  const lockedBalance = useMemo(
    () =>
      Object.values(stakingBalances).reduce(
        (prev, curr) => prev?.operate(curr, 'add'),
        Balance.Empty,
      ) ?? Balance.Empty,
    [stakingBalances],
  );

  const totalBalance = useMemo(
    () => availableBalance?.operate(lockedBalance, 'add'),
    [availableBalance, lockedBalance],
  );

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
    <LockedTokens
      availableBalance={availableBalance}
      lockedBalance={lockedBalance}
      totalBalance={totalBalance}
      onForwardPress={onForwardPress}
    />
  );
}
