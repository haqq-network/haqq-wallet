export enum NetworkProviderTypes {
  EVM = 'evm',
}

export enum NetworkProviderStage {
  TESTNET = 'testnet',
  MAINNET = 'mainnet',
}

export enum NetworkProviderStatus {
  PUBLISHED = 'published',
}

export interface NetworkProvider {
  id: string;
  name: string;
  icon: string;
  denom: string;
  chain_id: number;
  decimals: number;
  wei_denom: string;
  coin_name: string;
  explorer_url: string | undefined;
  cosmos_explorer_url: string | undefined;
  indexer_url: string;
  entry_point: string;
  stage: NetworkProviderStage;
  status: NetworkProviderStatus;
  network_type: NetworkProviderTypes;
  cosmos_chain_id: string | undefined;
  cosmos_entry_point: string | undefined;
}

export type NetworkProviderResponse = NetworkProvider[];
