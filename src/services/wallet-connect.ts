import {WALLET_CONNECT_PROJECT_ID, WALLET_CONNECT_RELAY_URL} from '@env';
import {Core} from '@walletconnect/core';
import {ICore} from '@walletconnect/types';
import {IWeb3Wallet, Web3Wallet} from '@walletconnect/web3wallet';

import {app} from '@app/contexts';
import {Events} from '@app/events';

// export async function createSignClient() {
//   console.log('[CONFIG] ENV_PROJECT_ID:', WALLET_CONNECT_PROJECT_ID);
//   console.log('[CONFIG] ENV_RELAY_URL:', WALLET_CONNECT_RELAY_URL);
//
//   return await SignClient.init({
//     logger: 'debug',
//     projectId: WALLET_CONNECT_PROJECT_ID,
//     relayUrl: WALLET_CONNECT_RELAY_URL,
//     metadata: {
//       name: 'React Native Wallet',
//       description: 'React Native Wallet for WalletConnect',
//       url: 'https://walletconnect.com/',
//       icons: ['https://avatars.githubusercontent.com/u/37784886'],
//     },
//   });
// }

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
          icons: [],
        },
      });

      console.log('connected');

      this._client.on('session_proposal', proposal => {
        console.log('proposal', proposal);
        app.emit(Events.onWalletConnectApproveConnection, proposal);
      });
    } catch (e) {
      console.log('err', e);
    }
  }

  async pair(uri: string) {
    console.log('this._client', !!this._client);
    if (this._client) {
      const resp = await this._client.core.pairing.pair({uri});

      console.log('resp', resp);
    }
  }

  async approveSession(
    proposalId: number,
    currentETHAddress: string,
    params: any,
  ) {
    if (!this._client) {
      return;
    }

    const {requiredNamespaces, relays} = params;

    const namespaces: SessionTypes.Namespaces = {};
    Object.keys(requiredNamespaces).forEach(key => {
      const accounts: string[] = [];
      requiredNamespaces[key].chains.map(chain => {
        [currentETHAddress].map(acc => accounts.push(`${chain}:${acc}`));
      });

      namespaces[key] = {
        accounts,
        methods: requiredNamespaces[key].methods,
        events: requiredNamespaces[key].events,
      };
    });

    await this._client.approveSession({
      id: proposalId,
      relayProtocol: relays[0].protocol,
      namespaces,
    });
  }
}
