import {useMemo} from 'react';

import {getRemoteBalanceValue} from '@app/helpers/get-remote-balance-value';
import {useRemoteConfigVar} from '@app/hooks/use-remote-config';
import {Balance} from '@app/services/balance';

export const useMinAmount = (): Balance => {
  const remoteMinAmount = useRemoteConfigVar('transfer_min_amount');

  const minAmount = useMemo(
    () => getRemoteBalanceValue('transfer_min_amount'),
    [remoteMinAmount],
  );
  return minAmount;
};
