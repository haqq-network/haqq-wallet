import {Provider} from '@app/models/provider';
import {getDefaultChainId} from '@app/network';
import {Explorer} from '@app/services/explorer';

const DEFAULT_EXPLORER = new Explorer(
  Provider.getByEthChainId(getDefaultChainId())?.explorer!,
);

const cache = new Map<string, Explorer>();

export function getExplorerInstanceForChainId(chainId: number) {
  const p = Provider.getByEthChainId(chainId);

  if (!p?.explorer) {
    return DEFAULT_EXPLORER;
  }

  if (cache.has(p.id)) {
    return cache.get(p.id)!;
  }

  const explorer = new Explorer(p.explorer);
  cache.set(p.id, explorer);
  return explorer;
}

export function getExplorerInstanceForProvider(providerId: string) {
  const p = Provider.getById(providerId);

  if (!p?.explorer) {
    return DEFAULT_EXPLORER;
  }

  if (cache.has(p.id)) {
    return cache.get(p.id)!;
  }

  const explorer = new Explorer(p.explorer);
  cache.set(p.id, explorer);
  return explorer;
}
