import {Balance, MIN_AMOUNT} from '@app/services/balance';
import {RemoteConfig} from '@app/services/remote-config';

export const getMinAmount = () => {
  const remoteMinAmount = RemoteConfig.get('transfer_min_amount');

  if (remoteMinAmount) {
    return new Balance(remoteMinAmount);
  }

  return MIN_AMOUNT;
};
