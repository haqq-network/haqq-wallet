import {SessionTypes} from '@walletconnect/types';

import {RootStackParamList} from '@app/types';

export type WalletConnectNamespace = Omit<SessionTypes.Namespace, 'accounts'>;

export type WalletConnectAllowedNamespaces = Record<
  string,
  WalletConnectNamespace
>;

export interface RemoteConfigBalanceTypes {
  cosmos_min_amount: string;
  cosmos_min_gas_limit: string;
  eth_min_amount: string;
  eth_min_gas_limit: string;
  transfer_min_amount: string;
  staking_reward_min_amount: string;
}

export interface RemoteConfigTypes extends RemoteConfigBalanceTypes {
  wallet_connect: WalletConnectAllowedNamespaces;
  web3_app_whitelist: string[];
  evm_endpoints: Record<string, string[]>;
  tm_endpoints: Record<string, string[]>;
  indexer_endpoints: Record<string, string>;
  ios_version: string;
  android_version: string;
  app_version: string;
  welcome_screen: keyof RootStackParamList;
  version: number;
  sss_apple: string;
  sss_google: string;
  airdrop_url: string;
  airdrop_gasdrop_secret: string;
  airdrop_gasdrop_campaign_id: string;
  pattern_source: string;
  sss_generate_shares_url: string;
  sss_metadata_url: string;
  keystone_tutorial_url: string;
}
