import {SessionTypes} from '@walletconnect/types';

export type WalletConnectAllowedNamespaces = Omit<
  SessionTypes.Namespaces,
  'accounts'
>;

export interface RemoteConfigTypes {
  wallet_connect: WalletConnectAllowedNamespaces;
  web3_app_whitelist: string[];
  evm_endpoints: Record<string, string[]>;
  tm_endpoints: Record<string, string[]>;
}
