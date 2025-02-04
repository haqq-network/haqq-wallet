import {Balance} from '@app/services/balance';

export enum EstimationVariant {
  low = 'low',
  average = 'average',
  high = 'fast',
  custom = 'custom',
}

export type CalculatedFees = {
  gasLimit: Balance;
  maxBaseFee: Balance;
  maxPriorityFee: Balance;
  expectedFee: Balance;
};
