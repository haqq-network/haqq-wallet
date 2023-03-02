import {SessionTypes, SignClientTypes} from '@walletconnect/types';

export type WalletConnectSessionType = SessionTypes.Struct;

export type WalletConnectSessionRequestType =
  SignClientTypes.EventArguments['session_request'];

export interface WalletConnectApproveConnectionEvent {
  id: number;
  params: SignClientTypes.EventArguments['session_proposal']['params'];
}
