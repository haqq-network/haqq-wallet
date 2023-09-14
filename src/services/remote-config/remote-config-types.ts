import {SessionTypes} from '@walletconnect/types';

import {RootStackParamList} from '@app/types';

export type WalletConnectAllowedNamespaces = Omit<
  SessionTypes.Namespaces,
  'accounts'
>;

export interface RemoteConfigTypes {
  wallet_connect: WalletConnectAllowedNamespaces;
  web3_app_whitelist: string[];
  evm_endpoints: Record<string, string[]>;
  tm_endpoints: Record<string, string[]>;
  indexer_endpoints: Record<string, string>;
  ios_version: string;
  android_version: string;
  welcome_screen: keyof RootStackParamList;
  version: number;
  transfer_min_amount: string;
  sss_apple: string;
  sss_google: string;
}
