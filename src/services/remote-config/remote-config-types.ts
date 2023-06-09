import {SessionTypes} from '@walletconnect/types';

export type WalletConnectAllowedNamespaces = Omit<
  SessionTypes.Namespaces,
  'accounts'
>;

export interface ConfigTypes {
  wallet_connect: WalletConnectAllowedNamespaces;
}
