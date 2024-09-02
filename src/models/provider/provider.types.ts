import {
  NetworkProvider,
  NetworkProviderStage,
  NetworkProviderStatus,
  NetworkProviderTypes,
} from '@app/services/backend';

export type ProviderID = string;

export const ALL_NETWORKS_PROVIDER: NetworkProvider = {
  id: 'all_networks',
  name: 'All Networks',
  icon: '',
  chain_id: -1,
  coin_name: 'All Network',
  cosmos_chain_id: undefined,
  cosmos_entry_point: undefined,
  cosmos_explorer_url: undefined,
  decimals: 0,
  denom: '',
  entry_point: '',
  explorer_url: undefined,
  indexer_url: '',
  network_type: NetworkProviderTypes.HAQQ,
  stage: NetworkProviderStage.MAINNET,
  status: NetworkProviderStatus.PUBLISHED,
  wei_denom: '',
};
