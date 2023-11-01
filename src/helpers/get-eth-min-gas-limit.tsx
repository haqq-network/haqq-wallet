import {Balance, MIN_GAS_LIMIT} from '@app/services/balance';
import {RemoteConfig} from '@app/services/remote-config';

export const getEthMinGasLimit = () => {
  const remoteMinGasLimit = RemoteConfig.get('eth_min_gas_limit');

  if (remoteMinGasLimit) {
    return new Balance(remoteMinGasLimit);
  }

  return MIN_GAS_LIMIT;
};
