import {useMemo} from 'react';

import {getMinAmount} from '@app/helpers/get-min-amount';
import {useRemoteConfigVar} from '@app/hooks/use-remote-config';
import {Balance} from '@app/services/balance';

export const useMinAmount = (): Balance => {
  const remoteMinAmount = useRemoteConfigVar('transfer_min_amount');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const minAmount = useMemo(() => getMinAmount(), [remoteMinAmount]);
  return minAmount;
};
