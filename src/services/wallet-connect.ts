import {WALLET_CONNECT_PROJECT_ID, WALLET_CONNECT_RELAY_URL} from '@env';
import SignClient from '@walletconnect/sign-client';

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
  private _client: SignClient | null = null;

  async init() {
    this._client = await SignClient.init({
      logger: 'debug',
      projectId: WALLET_CONNECT_PROJECT_ID,
      relayUrl: WALLET_CONNECT_RELAY_URL,
      metadata: {
        name: 'React Native Wallet',
        description: 'React Native Wallet for WalletConnect',
        url: 'https://walletconnect.com/',
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
      },
    });

    this._client.on('session_proposal', proposal => {
      app.emit(Events.onWalletConnectApproveConnection, proposal);
    });
  }

  async pair(uri: string) {
    if (this._client) {
      await this._client.core.pairing.pair({uri});
    }
  }
}
