import {SignClientTypes} from '@walletconnect/types';

export type WalletConnectSessionRequestEvent =
  SignClientTypes.EventArguments['session_request'];

export interface WalletConnectApproveConnectionEvent {
  id: number;
  params: SignClientTypes.EventArguments['session_proposal']['params'];
}
