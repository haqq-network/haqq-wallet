import React, {useMemo} from 'react';

import {LockedTokens} from '@app/components/locked-tokens';
import {
  formatBalanceToNumber,
  formatBalanceWithWEI,
} from '@app/helpers/formatters';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {useWalletsVisible} from '@app/hooks';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';

export function LockedTokensWrapper() {
  const visible = useWalletsVisible();
  const balances = useWalletsBalance(visible);

  const totalAmout = useMemo(
    () =>
      formatBalanceWithWEI(
        Object.values(balances).reduce(
          (prev, curr) => prev + formatBalanceToNumber(curr),
          0,
        ),
      ),
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
