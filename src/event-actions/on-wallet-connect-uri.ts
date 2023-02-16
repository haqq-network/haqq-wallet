import {WalletConnect} from '@app/services/wallet-connect';

export async function onWalletConnectUri(uri: string) {
  const resp = await WalletConnect.instance.pair(uri);

  console.log('resp', resp);
}
