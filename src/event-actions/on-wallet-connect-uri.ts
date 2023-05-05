import {I18N} from '@app/i18n';
import {sendNotification} from '@app/services';
import {WalletConnect} from '@app/services/wallet-connect';

export async function onWalletConnectUri(uri: string) {
  sendNotification(I18N.walletConnectPairPending);
  await WalletConnect.instance.pair(uri);
}
