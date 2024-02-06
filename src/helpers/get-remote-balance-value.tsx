import {Balance} from '@app/services/balance';
import {
  RemoteConfig,
  RemoteConfigBalanceTypes,
} from '@app/services/remote-config';
import {
  BALANCE_MULTIPLIER,
  COSMOS_MIN_AMOUNT,
  COSMOS_MIN_GAS_LIMIT,
  MIN_AMOUNT,
  MIN_GAS_LIMIT,
  MIN_STAKING_REWARD,
} from '@app/variables/balance';

export const getDefaultBalanceValue = <
  T extends keyof RemoteConfigBalanceTypes,
>(
  key: T,
): Balance => {
  switch (key) {
    case 'transfer_min_amount':
      return MIN_AMOUNT;
    case 'staking_reward_min_amount':
      return MIN_STAKING_REWARD;
    case 'cosmos_min_amount':
      return COSMOS_MIN_AMOUNT;
    case 'cosmos_min_gas_limit':
      return COSMOS_MIN_GAS_LIMIT;
    case 'cosmos_commission_multiplier':
      return BALANCE_MULTIPLIER;
    case 'eth_min_amount':
      return MIN_AMOUNT;
    case 'eth_min_gas_limit':
      return MIN_GAS_LIMIT;
    case 'eth_commission_multiplier':
      return BALANCE_MULTIPLIER;
    default:
      return Balance.Empty;
  }
};

export const getRemoteBalanceValue = <T extends keyof RemoteConfigBalanceTypes>(
  key: T,
) => {
  const remoteValue = RemoteConfig.get(key);

  if (remoteValue) {
    return new Balance(remoteValue);
  }

  return getDefaultBalanceValue(key);
};
