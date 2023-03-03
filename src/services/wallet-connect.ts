import {EventEmitter} from 'events';

import {WALLET_CONNECT_PROJECT_ID, WALLET_CONNECT_RELAY_URL} from '@env';
import {TransactionRequest} from '@haqq/provider-base';
import {Core} from '@walletconnect/core';
import {ICore, SessionTypes, SignClientTypes} from '@walletconnect/types';
import {getSdkError} from '@walletconnect/utils';
import {IWeb3Wallet, Web3Wallet} from '@walletconnect/web3wallet';

import {app} from '@app/contexts';
import {DEBUG_VARS} from '@app/debug-vars';
import {Events, WalletConnectEvents} from '@app/events';
import {
  awaitForBluetooth,
  getProviderInstanceForWallet,
  hideModal,
  showModal,
} from '@app/helpers';
import {Wallet} from '@app/models/wallet';
import {WalletConnectSessionMetadata} from '@app/models/wallet-connect-session-metadata';
import {Cosmos} from '@app/services/cosmos';
import {WalletType} from '@app/types';
import {getSignParamsMessage, getSignTypedDataParamsData} from '@app/utils';
import {EIP155_SIGNING_METHODS} from '@app/variables/EIP155';

export type WalletConnectEventTypes = keyof SignClientTypes.EventArguments;
export class WalletConnect extends EventEmitter {
  static instance = new WalletConnect();
  private _client: IWeb3Wallet | null = null;
  private _core: ICore | null = null;

  public getActiveSessions() {
    return this._client?.engine?.signClient?.session?.getAll?.() || [];
  }

  public disconnectSession(topic: string) {
    return this._client?.disconnectSession?.({
      reason: getSdkError('USER_DISCONNECTED'),
      topic,
    });
  }

  public async init() {
    try {
      if (DEBUG_VARS.enableWalletConnectLogger) {
        console.log(
          'WalletConnect:init',
          WALLET_CONNECT_PROJECT_ID,
          WALLET_CONNECT_RELAY_URL,
        );
      }

      this._core = new Core({
        logger: DEBUG_VARS.enableWalletConnectLogger ? 'debug' : 'error',
        projectId: WALLET_CONNECT_PROJECT_ID,
        relayUrl: WALLET_CONNECT_RELAY_URL,
      });

      this._client = await Web3Wallet.init({
        core: this._core,
        metadata: {
          name: 'HAQQ Wallet',
          description: 'HAQQ Wallet for WalletConnect',
          url: 'https://walletconnect.com/',
          icons: ['https://islamiccoin.net/favicon.ico'],
        },
      });

      this._emitActiveSessions();

      this
        // https://docs.walletconnect.com/2.0/javascript/web3wallet/wallet-usage#responding-to-session-requests
        ._walletConnectOnEvent('session_proposal', proposal => {
          if (DEBUG_VARS.enableWalletConnectLogger) {
            console.log(
              '🟢 session_proposal',
              JSON.stringify(proposal, null, 2),
            );
          }
          app.emit(Events.onWalletConnectApproveConnection, proposal);
        })
        // https://docs.walletconnect.com/2.0/javascript/web3wallet/wallet-usage#responding-to-session-requests
        .on('session_request', async event => {
          if (DEBUG_VARS.enableWalletConnectLogger) {
            console.log('🟢 session_request', JSON.stringify(event, null, 2));
          }
          app.emit(Events.onWalletConnectSignTransaction, event);
        })
        // https://docs.walletconnect.com/2.0/javascript/web3wallet/wallet-usage#extend-a-session
        .on('session_update', async event => {
          if (DEBUG_VARS.enableWalletConnectLogger) {
            console.log('🟢 session_update', JSON.stringify(event, null, 2));
          }
          await this._client?.extendSession?.({topic: event?.topic});
          this._emitActiveSessions();
        })
        .on('session_expire', this._emitActiveSessions.bind(this))
        .on('session_delete', this._emitActiveSessions.bind(this));

      // this event called when user disconect from web site
      this._client.core.expirer.on(
        'expirer_deleted',
        this._emitActiveSessions.bind(this),
      );
    } catch (err) {
      console.error('[WalletConnect] init error', err);
    }
  }

  public async pair(uri: string) {
    if (this._client) {
      const resp = await this._client.core.pairing.pair({uri});
      if (DEBUG_VARS.enableWalletConnectLogger) {
        console.log('WalletConnect:pair ', resp);
      }
      return resp;
    }
  }

  public rejectSession(eventId: number) {
    return this._client?.rejectSession?.({
      id: eventId,
      reason: getSdkError('USER_REJECTED'),
    });
  }

  public rejectSessionRequest(eventId: number, topic: string) {
    return this._client?.respondSessionRequest({
      topic,
      response: {
        id: eventId,
        jsonrpc: '2.0',
        error: getSdkError('USER_REJECTED'),
      },
    });
  }

  public async approveSession(
    proposalId: number,
    currentETHAddress: string,
    params: SignClientTypes.EventArguments['session_proposal']['params'],
  ) {
    if (!this._client) {
      return;
    }

    console.log(proposalId, params);

    const {requiredNamespaces, relays} = params;

    const namespaces: SessionTypes.Namespaces = {};
    Object.keys(requiredNamespaces).forEach(key => {
      const accounts: string[] = [];
      requiredNamespaces?.[key]?.chains?.map?.((chain: any) => {
        [currentETHAddress].map(acc => accounts.push(`${chain}:${acc}`));
      });

      namespaces[key] = {
        accounts,
        methods: requiredNamespaces[key].methods,
        events: requiredNamespaces[key].events,
      };
    });

    const session = await this._client.approveSession({
      id: proposalId,
      relayProtocol: relays[0].protocol,
      namespaces,
    });

    WalletConnectSessionMetadata.create(session.topic);
    this._emitActiveSessions();
    return session;
  }

  public getSessionByTopic(topic: string) {
    return this._client?.engine?.signClient?.session?.get?.(topic);
  }

  public async approveEIP155Request(
    wallet: Wallet,
    event: SignClientTypes.EventArguments['session_request'],
  ) {
    const provider = getProviderInstanceForWallet(wallet);

    if (!wallet?.path || !provider) {
      throw new Error(
        '[WalletConnect:approveEIP155Request]: wallet.path or provider is undefined',
      );
    }

    if (wallet.type === WalletType.ledgerBt) {
      await awaitForBluetooth();
      showModal('ledger-attention');
    }

    const {params, id, topic} = event;
    const {request, chainId} = params;
    let result: string | undefined;

    switch (request.method) {
      case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
      case EIP155_SIGNING_METHODS.ETH_SIGN:
        const message = getSignParamsMessage(request.params);
        result = await provider.signPersonalMessage(wallet.path, message);
        break;
      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
        const {
          domain,
          types,
          message: typedMessage,
        } = getSignTypedDataParamsData(request.params);

        // https://github.com/ethers-io/ethers.js/issues/687#issuecomment-714069471
        // delete types.EIP712Domain;

        const cosmos = new Cosmos(app.provider!);
        const signedMessageHash = await cosmos.signTypedData(
          wallet.path!,
          provider,
          domain,
          types,
          typedMessage,
        );

        if (wallet.type === WalletType.ledgerBt) {
          result = signedMessageHash;
        } else {
          result = `0x${signedMessageHash}`;
        }
        break;
      case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
        const signTransactionRequest: TransactionRequest = request.params[0];
        delete signTransactionRequest.from;
        signTransactionRequest.chainId = Number(chainId?.split?.(':')?.[1]);

        result = await provider.signTransaction(
          wallet.path,
          signTransactionRequest,
        );
        break;
      default:
        throw new Error('[WalletConnect:approveEIP155Request]: INVALID_METHOD');
    }

    if (wallet.type === WalletType.ledgerBt) {
      hideModal('ledger-attention');
    }

    if (!result) {
      throw new Error(
        '[WalletConnect:approveEIP155Request]: result is undefined',
      );
    }

    if (DEBUG_VARS.enableWalletConnectLogger) {
      console.log('✅ approveEIP155Request result:', result, result.length);
    }

    return await this._client?.respondSessionRequest({
      topic,
      response: {id, result, jsonrpc: '2.0'},
    });
  }

  private _emitActiveSessions() {
    this.emit(WalletConnectEvents.onSessionsChange, this.getActiveSessions());
  }

  // typed fix for `Web3Wallet.on`
  private _walletConnectOnEvent<EventName extends WalletConnectEventTypes>(
    eventName: EventName,
    cb: (event: SignClientTypes.EventArguments[EventName]) => void,
  ) {
    // @ts-ignore
    return this._client?.on?.(eventName, cb) as unknown as Omit<
      EventEmitter,
      'on'
    > & {
      on: typeof WalletConnect.instance._walletConnectOnEvent;
    };
  }
}
