import {Provider} from '@app/models/provider';
import {Balance} from '@app/services/balance';
import {IndexerBalance} from '@app/types';

import {IndexerBalanceItem} from './../types';
import {AddressUtils} from './address-utils';
import {getRpcProvider} from './get-rpc-provider';

const logger = Logger.create('safeLoadBalances');

export const safeLoadBalances = async (wallets: string[]) => {
  let balances: {total: IndexerBalance} | null = null;

  try {
    balances = {
      total: (await loadBalancesFromRpc(wallets))!,
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

export const loadBalancesFromRpc = async (wallets: string[]) => {
  try {
    const rpcProvider = await getRpcProvider(Provider.selectedProvider);
    const balancesFromRpc = await Promise.all(
      wallets.map(async w => {
        let balance = '0x00';
        try {
          balance = (await rpcProvider.getBalance(w))._hex;
        } catch {}
        return [
          AddressUtils.toEth(w),
          Provider.selectedProvider.ethChainId,
          balance,
        ] as IndexerBalanceItem;
      }),
    );
    return balancesFromRpc;
  } catch (e) {
    logger.error('Failed to load balances from rpc', e);
  }
};
