import {SessionTypes} from '@walletconnect/types';

import {Currency} from '@app/models/types';
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
    airdrop_gasdrop_campaign_id: string;
    airdrop_gasdrop_secret: string;
    airdrop_url: string;
    android_version: string;
    app_version: string;
    cosmos_commission_multilplier: string | number;
    cosmos_explorer: ExplorerUrlsMap;
    cosmos_min_amount: string;
    cosmos_min_gas_limit: string;
    currency: Currency;
    eth_commission_multilplier: string | number;
    eth_explorer: ExplorerUrlsMap;
    eth_min_amount: string;
    eth_min_gas_limit: string;
    evm_endpoints: Record<string, string[]>;
    keystone_tutorial_url: string;
    indexer_endpoints: Record<string, string>;
    ios_version: string;
    pattern_source: string;
    sss_apple: string;
    sss_custom: string | undefined;
    sss_custom_url: string | undefined;
    sss_generate_shares_url: string;
    sss_google: string;
    sss_metadata_url: string;
    tm_endpoints: Record<string, string[]>;
    version: number;
    wallet_connect: WalletConnectAllowedNamespaces;
    web3_app_whitelist: string[];
    web3_browser_bookmarks: Omit<Link, 'subtitle' | 'id'>[];
    welcome_screen: keyof RootStackParamList;
    tx_timestamp_headers: boolean;
  };
