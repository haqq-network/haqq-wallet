import {
  NetworkProvider,
  NetworkProviderStage,
  NetworkProviderStatus,
  NetworkProviderTypes,
} from '@app/services/backend';
import {RemoteConfig} from '@app/services/remote-config';

export type ProviderID = string;

export const ALL_NETWORKS_ID = 'all_networks';
export const ALL_NETWORKS_CHAIN_ID = -1;
export const ALL_NETWORKS_PROVIDER: NetworkProvider = {
  id: ALL_NETWORKS_ID,
  name: 'All Networks',
  icon: '',
  chain_id: ALL_NETWORKS_CHAIN_ID,
  coin_name: 'All Network',
  cosmos_chain_id: undefined,
  cosmos_entry_point: undefined,
  cosmos_explorer_url: undefined,
  decimals: 18,
  denom: '',
  entry_point: 'https://rpc.eth.haqq.network/',
  explorer_url: undefined,
  indexer_url: RemoteConfig.get('proxy_server')!,
  network_type: NetworkProviderTypes.ALL,
  stage: NetworkProviderStage.MAINNET,
  status: NetworkProviderStatus.PUBLISHED,
  wei_denom: '',
};
