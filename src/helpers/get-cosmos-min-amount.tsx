import {Balance} from '@app/services/balance';
import {COSMOS_MIN_AMOUNT} from '@app/services/cosmos';
import {RemoteConfig} from '@app/services/remote-config';

export const getCosmosMinAmount = () => {
  const remoteMinAmount = RemoteConfig.get('cosmos_min_amount');

  if (remoteMinAmount) {
    return new Balance(remoteMinAmount);
  }

  return COSMOS_MIN_AMOUNT;
};
