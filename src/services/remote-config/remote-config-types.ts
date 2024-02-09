import {SessionTypes} from '@walletconnect/types';

import {ChainId, Link, RootStackParamList} from '@app/types';

export type WalletConnectNamespace = Omit<SessionTypes.Namespace, 'accounts'>;

export type WalletConnectAllowedNamespaces = Record<
  string,
  WalletConnectNamespace
>;

export type RemoteConfigBalanceTypes = {
  cosmos_min_amount: string;
  cosmos_min_gas_limit: string;
  eth_min_amount: string;
  eth_min_gas_limit: string;
  transfer_min_amount: string;
  staking_reward_min_amount: string;
};

export type RemoteConfigMultiplierTypes = {
  cosmos_commission_multiplier: number;
  eth_commission_multiplier: number;
};

export type ExplorerUrlsMap = Record<ChainId, string>;

export type RemoteConfigTypes = RemoteConfigBalanceTypes &
  RemoteConfigMultiplierTypes & {
    eth_explorer: ExplorerUrlsMap;
    cosmos_explorer: ExplorerUrlsMap;
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
    sss_custom: string | undefined;
    sss_custom_url: string | undefined;
    web3_browser_bookmarks: Omit<Link, 'subtitle' | 'id'>[];
  };
