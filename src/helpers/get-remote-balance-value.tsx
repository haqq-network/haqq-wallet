import {Balance, MIN_AMOUNT} from '@app/services/balance';
import {
  RemoteConfig,
  RemoteConfigBalanceTypes,
} from '@app/services/remote-config';

export const getRemoteBalanceValue = <T extends keyof RemoteConfigBalanceTypes>(
  key: T,
) => {
  const remoteValue = RemoteConfig.get(key);

  if (remoteValue) {
    return new Balance(remoteValue);
  }

  return MIN_AMOUNT;
};
