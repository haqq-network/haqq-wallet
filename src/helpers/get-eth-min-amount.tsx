import {Balance, MIN_AMOUNT} from '@app/services/balance';
import {RemoteConfig} from '@app/services/remote-config';

export const getEthMinAmount = () => {
  const remoteMinAmount = RemoteConfig.get('eth_min_amount');

  if (remoteMinAmount) {
    return new Balance(remoteMinAmount);
  }

  return MIN_AMOUNT;
};
