import {parseUri} from '@walletconnect/utils';

import {I18N} from '@app/i18n';
import {sendNotification} from '@app/services';
import {WalletConnect} from '@app/services/wallet-connect';

export async function onWalletConnectUri(uri: string) {
  const {version} = parseUri(uri);
  if (version === 1) {
    return sendNotification(I18N.walletConnectNotSupported);
  }
  sendNotification(I18N.walletConnectPairPending);
  await WalletConnect.instance.pair(uri);
}
