import {
  NetworkProvider,
  NetworkProviderStage,
  NetworkProviderStatus,
  NetworkProviderTypes,
} from '@app/services/backend';

export type ProviderID = string;

export const INDEXER_PROXY_ENDPOINT = 'https://proxy.indexer.haqq.network';

export const ALL_NETWORKS_ID = 'all_networks';
export const ALL_NETWORKS_PROVIDER: NetworkProvider = {
  id: ALL_NETWORKS_ID,
  name: 'All Networks',
  icon: '',
  chain_id: -1,
  coin_name: 'All Network',
  cosmos_chain_id: undefined,
  cosmos_entry_point: undefined,
  cosmos_explorer_url: undefined,
  decimals: 0,
  denom: '',
  entry_point: 'https://rpc.eth.haqq.network/',
  explorer_url: undefined,
  indexer_url: INDEXER_PROXY_ENDPOINT,
  network_type: NetworkProviderTypes.EVM,
  stage: NetworkProviderStage.MAINNET,
  status: NetworkProviderStatus.PUBLISHED,
  wei_denom: '',
};
