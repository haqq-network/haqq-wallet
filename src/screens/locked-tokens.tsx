import React, {useMemo} from 'react';

import {LockedTokens} from '@app/components/locked-tokens';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {useWalletsVisible} from '@app/hooks';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {useWalletsStakingBalance} from '@app/hooks/use-wallets-staking-balance';
import {WEI} from '@app/variables/common';

export function LockedTokensWrapper() {
  const visible = useWalletsVisible();
  const balances = useWalletsBalance(visible);
  const stakingBalances = useWalletsStakingBalance(visible);

  const availableAmount = useMemo(
    () =>
      Object.values(balances).reduce(
        (prev, curr) => prev + (curr?.toNumber() ?? 0),
        0,
      ) / WEI,
    [balances],
  );

  const lockedAmount = useMemo(
    () =>
      Object.values(stakingBalances).reduce(
        (prev, curr) => prev + (curr?.toNumber() ?? 0),
        0,
      ) / WEI,
    [stakingBalances],
  );

  const totalAmout = useMemo(
    () => availableAmount + lockedAmount,
    [availableAmount, lockedAmount],
  );

  if (
    visible.length <= 1 ||
    !isFeatureEnabled(Feature.lockedStakedVestedTokens)
  ) {
    return null;
  }

  return (
    <LockedTokens
      availableAmount={availableAmount}
      lockedAmount={lockedAmount}
      totalAmout={totalAmout}
      onForwardPress={() => {}}
    />
  );
}
