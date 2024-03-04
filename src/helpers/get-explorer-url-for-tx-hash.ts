import {app} from '@app/contexts';
import {RemoteConfig} from '@app/services/remote-config';

const TX_URL_PATTERN = '{{tx_hash}}';

export function getExplorerUrlForTxHash(
  txHash: string,
  chainId = app.provider.cosmosChainId,
) {
  if (!txHash) {
    return '';
  }

  if (txHash.startsWith('0x') || txHash.startsWith('0X')) {
    const ethExlorerUrls = RemoteConfig.safeGet('eth_explorer');
    const urlPattern = ethExlorerUrls[chainId];
    return urlPattern.replace(TX_URL_PATTERN, txHash);
  }

  const cosmosExlorerUrls = RemoteConfig.safeGet('cosmos_explorer');
  const urlPattern = cosmosExlorerUrls[chainId];
  return urlPattern.replace(TX_URL_PATTERN, txHash);
}
