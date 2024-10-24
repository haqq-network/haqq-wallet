import {
  AddressCosmosHaqq,
  IContract,
  IndexerBalance,
  IndexerTime,
  IndexerToken,
  RatesResponse,
} from '@app/types';
import {EIP155_SIGNING_METHODS} from '@app/variables/EIP155';

export type IndexerUpdatesResponse = {
  addresses: IContract[];
  balance: IndexerBalance;
  staked: IndexerBalance;
  total_staked: IndexerBalance;
  vested: IndexerBalance;
  available: IndexerBalance;
  locked: IndexerBalance;
  total: IndexerBalance;
  available_for_stake: IndexerBalance;
  // next time for unlock vested tokens
  unlock: IndexerTime;
  last_update: string;
  // TODO: add types
  nfts: unknown[];
  tokens: IndexerToken[];
  transactions: unknown[];
  rates: RatesResponse;
};

export type IndexerAddressesResponse = IContract[];

export type SushiRoute = {
  fee: number;
  liquidity: string; // number liquidity for the pool
  route: AddressCosmosHaqq[];
  pools: AddressCosmosHaqq[];
  route_hex: string; // hex route for SwapRouterV3
  token0: AddressCosmosHaqq;
  token1: AddressCosmosHaqq;
};

export type SushiPool = {
  fee: string;
  name: string;
  pool: AddressCosmosHaqq;
};

export type SushiPoolResponse = {
  contracts: IContract[];
  routes: SushiRoute[];
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
  route: string; // The route for the swap
  // token_in: string; // The input token address
  // token_out: string; // The output token address
  sender: string; // The sender address
  amount: string; // The hex amount to swap
  currency_id?: string; // The currency id
  abortSignal?: AbortSignal;
};

export type ProviderConfig = {
  enable_unwrapWETH9_call?: boolean;
  nft_exists?: boolean;
  bech32_exists?: boolean;
  swap_enabled: boolean;
  swap_router_v3: string;
  weth_address: string;
  weth_symbol: string;
  explorer_address_url: string;
  explorer_cosmos_tx_url?: string;
  explorer_token_url: string;
  explorer_tx_url: string;
  explorer_token_id_url: string;
  swap_default_token0: string;
  swap_default_token1: string;
};

export type VerifyContractRequest = {
  method_name: EIP155_SIGNING_METHODS | string;
  domain: string;
  message_or_input?: string;
  address?: string;
};

export type VerifyContractResponse = {
  domain_in_whitelist: boolean;
  message_is_valid: boolean;
  input_is_valid: boolean;
  is_eip4361: boolean;
  contract: IContract | null;
};
