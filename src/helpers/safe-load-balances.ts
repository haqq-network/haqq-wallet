import {Provider} from '@app/models/provider';
import {Balance} from '@app/services/balance';
import {RpcFetch} from '@app/services/rpc';
import {IndexerBalance} from '@app/types';

import {IndexerBalanceItem} from './../types';

const logger = Logger.create('safeLoadBalances');

export const safeLoadBalances = async (wallets: string[]) => {
  let balances: {total: IndexerBalance} | null = null;

  try {
    balances = {
      total: (await RpcFetch.cosmos.balance(wallets)).available!,
    };
  } catch (e) {
    logger.error('Failed to load balances from rpc', e);
  }

  if (!balances?.total) {
    const emptyBalances = wallets.map(
      w =>
        [
          w,
          Provider.selectedProvider.ethChainId,
          Balance.Empty,
        ] as unknown as IndexerBalanceItem,
    );
    balances = {
      total: emptyBalances,
    };
  }

  return balances;
};
