import React, {useMemo} from 'react';

import {LockedTokens} from '@app/components/locked-tokens';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {useWalletsVisible} from '@app/hooks';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {WEI} from '@app/variables/common';

export function LockedTokensWrapper() {
  const visible = useWalletsVisible();
  const balances = useWalletsBalance(visible);

  const totalAmout = useMemo(
    () =>
      Object.values(balances).reduce(
        (prev, curr) => prev + curr.toNumber(),
        0,
      ) / WEI,
    [balances],
  );

  if (
    visible.length < 1 ||
    !isFeatureEnabled(Feature.lockedStakedVestedTokens)
  ) {
    return null;
  }

  return (
    <LockedTokens
      availableAmout={1414}
      lockedAmout={114}
      totalAmout={totalAmout}
      onForwardPress={() => {}}
    />
  );
}
