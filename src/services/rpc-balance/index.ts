import {fetchCosmosBalances} from './cosmos-balance';
import {fetchEvmBalance} from './evm-balance';

export const FetchRpcBalance = {
  evm: fetchEvmBalance,
  cosmos: fetchCosmosBalances,
};
