export type ProviderID = string;

export type AllNetworksProvider = {
  name: string;
  coinName: string;
  denom: string;
  id: string;
  ethChainId: number;
};

export const ALL_NETWORKS_PROVIDER: AllNetworksProvider = {
  name: 'All Networks',
  coinName: 'All Network',
  denom: 'All Network',
  id: 'all_networks',
  ethChainId: -1,
};
