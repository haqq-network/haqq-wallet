import {Balance} from '@app/services/balance';

export enum EstimationVariant {
  low,
  average,
  high,
  custom,
}

export type CalculatedFees = {
  gasLimit: Balance;
  maxBaseFee: Balance;
  maxPriorityFee: Balance;
  expectedFee: Balance;
};
