import {Balance} from '@app/types';
import {WEI} from '@app/variables/common';

export const formatBalanceToNumber = (balance: Balance): number => {
  return Number(balance.toString());
};

export const formatBalanceWithWEI = (
  balance: Balance | number | string,
): number => {
  if (!balance) {
    return 0;
  }

  return Number(balance.toString()) / WEI;
};
