import {NftItemIndexer} from '@app/models/nft';
import {IndexerUpdatesResponse} from '@app/services/indexer';
import {IndexerToken, IndexerTransactionResponse} from '@app/types';

export interface RPCMessageGeneric<Type extends string = '', Data = {}> {
  type: Type;
  data: Data;
}

export type RPCMessage =
  | RPCBalanceMessage
  | RPCTransactionsMessage
  | RPCNftMessage
  | RPCTokenMessage
  | RPCEmptyMessage;

export interface RPCObserver {
  /**
   * RPC Message callback
   * Note: Constructor should have when reaction for Socket.lastMessage
   * @private
   */
  onMessage: (message: RPCMessage) => void;
}

// Default message
export type RPCEmptyMessage = RPCMessageGeneric<'', {}>;

// Balances
type RPCBalanceData = IndexerUpdatesResponse;
export type RPCBalanceMessage = RPCMessageGeneric<'balance', RPCBalanceData>;

// Transaction
type RPCTransactionsData = IndexerTransactionResponse;
export type RPCTransactionsMessage = RPCMessageGeneric<
  'transaction',
  RPCTransactionsData
>;

// NFTs
type RPCNftData = NftItemIndexer;
export type RPCNftMessage = RPCMessageGeneric<'nft', RPCNftData>;

// Tokens
type RPCTokenData = IndexerToken;
export type RPCTokenMessage = RPCMessageGeneric<'token', RPCTokenData>;
