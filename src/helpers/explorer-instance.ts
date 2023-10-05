import {Provider} from '@app/models/provider';
import {getDefaultChainId} from '@app/network';
import {Explorer} from '@app/services/explorer';

const DEFAULT_EXPLORER = new Explorer(
  Provider.getByEthChainId(getDefaultChainId())?.explorer!,
);

export function getExplorerInstanceForChainId(chainId: number) {
  const p = Provider.getByEthChainId(chainId);

  if (!p?.explorer) {
    return DEFAULT_EXPLORER;
  }

  return new Explorer(p.explorer);
}

export function getExplorerInstanceForProvider(providerId: string) {
  const p = Provider.getById(providerId);

  if (!p?.explorer) {
    return DEFAULT_EXPLORER;
  }

  return new Explorer(p.explorer);
}
