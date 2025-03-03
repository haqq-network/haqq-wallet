import {JsonRpcProvider} from '@ethersproject/providers';

import {AddressUtils} from '@app/helpers/address-utils';
import {getRpcProvider} from '@app/helpers/get-rpc-provider';
import {Provider} from '@app/models/provider';
import {IndexerBalanceItem} from '@app/types';

async function fetchEvmBalanceForWallet(
  address: string,
  rpcProvider: JsonRpcProvider,
): Promise<IndexerBalanceItem> {
  let balance = '0x00';
  try {
    balance = (await rpcProvider.getBalance(address))._hex;
  } catch {}
  return [
    AddressUtils.toEth(address),
    Provider.selectedProvider.ethChainId,
    balance,
  ] as IndexerBalanceItem;
}

export async function fetchEvmBalance(
  wallets: string[],
): Promise<IndexerBalanceItem[]> {
  try {
    const rpcProvider = await getRpcProvider(Provider.selectedProvider);
    const balancesFromRpc = await Promise.all(
      wallets.map(w => fetchEvmBalanceForWallet(w, rpcProvider)),
    );
    return balancesFromRpc;
  } catch (e) {
    Logger.error('Failed to load evm balances from rpc', e);
    return [];
  }
}
