import React, {useCallback, useMemo} from 'react';

import {observer} from 'mobx-react';

import {LockedTokens} from '@app/components/locked-tokens';
import {useTypedNavigation} from '@app/hooks';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {Wallet} from '@app/models/wallet';
import {calculateBalances} from '@app/utils';

export const LockedTokensWrapper = observer(() => {
  const visible = Wallet.getAllVisible();
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

  if (visible.length <= 1) {
    return null;
  }

  return (
    <LockedTokens balance={calculatedBalance} onForwardPress={onForwardPress} />
  );
});
