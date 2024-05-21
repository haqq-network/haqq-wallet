import {IContract} from '@app/types';

export type SushiPool = {
  from: string; // input token
  to: string; // out token
  path: string; // swap path for SwapRouterV3
};

export type SushiPoolResponse = {
  contracts: IContract[];
  pools: SushiPool[];
};

export type SushiPoolEstimateResponse = {
  allowance: string; // The allowance amount for the pool
  amount_in: string; // The input hex amount for the pool
  amount_out: string; // The output hex amount for the pool
  fee: {
    amount: string; // The fee amount for the pool
    denom: string; // The denomination for the fee
  };
  gas_estimate: string; // The estimated gas for the pool
  initialized_ticks_crossed_list: number[]; // The list of initialized ticks crossed
  need_approve: boolean; // Indicates if ERC20 token approval is needed
  route: string; // The route for the pool
  s_amount_in: string; // (sushi backend resp) input amount for the pool
  s_assumed_amount_out: string; // (sushi backend resp) assumed output amount for the pool
  s_gas_spent: number; //  (sushi backend resp) gas spent for the pool
  s_price_impact: string; // (sushi backend resp) price impact for the pool
  s_primary_price: string; // (sushi backend resp) primary price for the pool
  s_swap_price: string; //  (sushi backend resp) swap price for the pool
  sqrt_price_x96_after_list: string[]; // The list of square root prices after crossing ticks
};

export type SushiPoolEstimateRequest = {
  token_in: string; // The input token address
  token_out: string; // The output token address
  sender: string; // The sender address
  amount: string; // The hex amount to swap
  currency_id?: string; // The currency id
};
