import {WalletConnect} from '@app/services/wallet-connect';

export async function onWalletConnectUri(uri: string) {
  await WalletConnect.instance.pair(uri);
}
