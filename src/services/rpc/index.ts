import {fetchCosmosBalances} from './cosmos-balance';
import {fetchEvmBalance} from './evm-balance';

export const RpcFetch = {
  evm: {
    balance: fetchEvmBalance,
  },
  cosmos: {
    balance: fetchCosmosBalances,
  },
};
