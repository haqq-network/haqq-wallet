import {Provider} from '@app/models/provider';
import {Balance} from '@app/services/balance';
import {Indexer} from '@app/services/indexer';
import {IndexerBalance} from '@app/types';

import {AddressUtils} from './address-utils';
import {getRpcProvider} from './get-rpc-provider';

const logger = Logger.create('safeLoadBalances');

export const safeLoadBalances = async (wallets: string[]) => {
  let balances: {total: IndexerBalance} | null = null;

  try {
    balances = await Indexer.instance.updates(wallets, new Date());
  } catch (e) {
    logger.error('Failed to load balances from indexer', e);
  }

  if (!balances) {
    try {
      const rpcProvider = await getRpcProvider(Provider.selectedProvider);
      const balancesFromRpc = await Promise.all(
        wallets.map(async w => {
          let balance = '0x00';
          try {
            balance = (await rpcProvider.getBalance(w))._hex;
          } catch {}
          return [AddressUtils.toHaqq(w), balance];
        }),
      );
      balances = {
        total: Object.fromEntries(balancesFromRpc),
      };
    } catch (e) {
      logger.error('Failed to load balances from rpc', e);
    }
  }

  if (!balances) {
    const emptyBalances = wallets.map(w => [w, Balance.Empty]);
    balances = {
      total: Object.fromEntries(emptyBalances),
    };
  }

  return balances;
};
