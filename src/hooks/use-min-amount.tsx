import {getMinAmount} from '@app/helpers/get-min-amount';
import {Balance} from '@app/services/balance';

export const useMinAmount = (): Balance => {
  return getMinAmount();
};
