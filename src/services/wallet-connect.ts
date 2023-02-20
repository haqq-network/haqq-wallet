import {WALLET_CONNECT_PROJECT_ID, WALLET_CONNECT_RELAY_URL} from '@env';
import {TransactionRequest} from '@haqq/provider-base';
import {Core} from '@walletconnect/core';
import {ICore, SessionTypes, SignClientTypes} from '@walletconnect/types';
import {IWeb3Wallet, Web3Wallet} from '@walletconnect/web3wallet';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {getProviderInstanceForWallet} from '@app/helpers';
import {Wallet} from '@app/models/wallet';
import {Cosmos} from '@app/services/cosmos';
import {getSignParamsMessage, getSignTypedDataParamsData} from '@app/utils';
import {EIP155_SIGNING_METHODS} from '@app/variables/EIP155';

export class WalletConnect {
  static instance = new WalletConnect();
  private _client: IWeb3Wallet | null = null;
  private _core: ICore | null = null;

  async init() {
    try {
      console.log(
        'this._client',
        WALLET_CONNECT_PROJECT_ID,
        WALLET_CONNECT_RELAY_URL,
      );

      this._core = new Core({
        logger: 'debug',
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

      this._client
        // https://docs.walletconnect.com/2.0/javascript/web3wallet/wallet-usage#responding-to-session-requests
        .on(
          'session_proposal',
          (proposal: SignClientTypes.EventArguments['session_proposal']) => {
            console.log(
              '🟢 session_proposal',
              JSON.stringify(proposal, null, 2),
            );
            app.emit(Events.onWalletConnectApproveConnection, proposal);
          },
        )
        // https://docs.walletconnect.com/2.0/javascript/web3wallet/wallet-usage#responding-to-session-requests
        .on(
          'session_request',
          async (event: SignClientTypes.EventArguments['session_request']) => {
            console.log('🟢 session_request', JSON.stringify(event, null, 2));
            app.emit(Events.onWalletConnectSignTransaction, event);
          },
        )
        // https://docs.walletconnect.com/2.0/javascript/web3wallet/wallet-usage#extend-a-session
        .on(
          'session_update',
          async (event: SignClientTypes.EventArguments['session_update']) => {
            console.log('🟢 session_update', JSON.stringify(event, null, 2));
            const {topic} = event;
            await this._client?.extendSession?.({topic});
          },
        );
    } catch (err) {
      console.error('[WalletConnect] init error', err);
    }
  }

  async pair(uri: string) {
    console.log('this._client', !!this._client);
    if (this._client) {
      const resp = await this._client.core.pairing.pair({uri});
      console.log('resp', resp);
      return resp;
    }
  }

  async approveSession(
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

    const {params, id, topic} = event;
    const {request} = params;
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

        result = `0x${signedMessageHash}`;
        break;
      case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
        const signTransactionRequest: TransactionRequest = request.params[0];
        delete signTransactionRequest.from;

        result = await provider.signTransaction(
          wallet.path,
          signTransactionRequest,
        );
        break;
      default:
        throw new Error('[WalletConnect:approveEIP155Request]: INVALID_METHOD');
    }

    if (!result) {
      throw new Error(
        '[WalletConnect:approveEIP155Request]: result is undefined',
      );
    }

    console.log('✅ approveEIP155Request result:', result, result.length);

    return await this._client?.respondSessionRequest({
      topic,
      response: {id, result, jsonrpc: '2.0'},
    });
  }
}
