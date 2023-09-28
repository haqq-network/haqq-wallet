import React, {useCallback, useMemo} from 'react';

import {LockedTokens} from '@app/components/locked-tokens';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {useTypedNavigation, useWalletsVisible} from '@app/hooks';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {useWalletsStakingBalance} from '@app/hooks/use-wallets-staking-balance';
import {useWalletsVestingBalance} from '@app/hooks/use-wallets-vesting-balance';
import {Balance} from '@app/services/balance';

export function LockedTokensWrapper() {
  const visible = useWalletsVisible();
  const balances = useWalletsBalance(visible);
  const stakingBalances = useWalletsStakingBalance(visible);
  const vestingBalance = useWalletsVestingBalance(visible);

  const navigation = useTypedNavigation();
  const availableBalance = useMemo(
    () =>
      Object.values(balances).reduce(
        (prev, curr) => prev?.operate(curr, 'add'),
        Balance.Empty,
      ) ?? Balance.Empty,
    [balances],
  );

  const staked = useMemo(
    () =>
      Object.values(stakingBalances).reduce(
        (prev, curr) => prev?.operate(curr, 'add'),
        Balance.Empty,
      ) ?? Balance.Empty,
    [stakingBalances],
  );

  const vested = useMemo(
    () =>
      Object.values(vestingBalance).reduce(
        (prev, curr) => prev?.operate(curr, 'add'),
        Balance.Empty,
      ) ?? Balance.Empty,
    [vestingBalance],
  );

  const locked = useMemo(() => {
    if (staked && !vested) {
      staked;
    }

    if (!staked && vested) {
      return vested;
    }

    if (!staked || !vested) {
      return Balance.Empty;
    }

    return staked.operate(vested, 'add');
  }, [staked, vested]);

  const totalBalance = useMemo(
    () => availableBalance?.operate(locked, 'add'),
    [availableBalance, locked],
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
      lockedBalance={locked}
      totalBalance={totalBalance}
      onForwardPress={onForwardPress}
    />
  );
}
