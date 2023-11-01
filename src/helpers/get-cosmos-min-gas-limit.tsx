import {Balance} from '@app/services/balance';
import {COSMOS_MIN_GAS_LIMIT} from '@app/services/cosmos';
import {RemoteConfig} from '@app/services/remote-config';

export const getCosmosMinGasLimit = () => {
  const remoteMinGasLimit = RemoteConfig.get('cosmos_min_gas_limit');

  if (remoteMinGasLimit) {
    return new Balance(remoteMinGasLimit);
  }

  return COSMOS_MIN_GAS_LIMIT;
};
