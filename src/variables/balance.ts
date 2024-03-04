import {Balance} from '@app/services/balance';

export const MIN_AMOUNT = new Balance(0.001);
export const MIN_STAKING_REWARD = new Balance(0.01);
export const MIN_GAS_LIMIT = new Balance(22_000, 0);
export const FEE_AMOUNT = new Balance(0.00001);
export const BALANCE_MULTIPLIER = new Balance(1.56, 0);
export const COSMOS_MIN_AMOUNT = new Balance('2000000000');
export const COSMOS_MIN_GAS_LIMIT = new Balance('2000000');
