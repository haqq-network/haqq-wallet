import {parseUri} from '@walletconnect/utils';

import {hideModal, showModal} from '@app/helpers';
import {I18N} from '@app/i18n';
import {sendNotification} from '@app/services';
import {WalletConnect} from '@app/services/wallet-connect';
import {ModalType} from '@app/types';
import {sleep} from '@app/utils';

const safeParse = (uri: string) => {
  try {
    return parseUri(uri);
  } catch (e) {
    return undefined;
  }
};

export async function onWalletConnectUri(uri: string) {
  try {
    const handled = await WalletConnect.instance.handleRequest(uri);
    if (handled) {
      return;
    }
    const parsed = safeParse(uri);
    if (!parsed?.topic) {
      Logger.error('onWalletConnectUri invalid uri', uri);
      return sendNotification(I18N.walletConnectInvalidUri);
    }

    if (parsed.version === 1) {
      return sendNotification(I18N.walletConnectNotSupported);
    }
    showModal(ModalType.loading);
    sendNotification(I18N.walletConnectPairPending);
    await WalletConnect.instance.pair(uri);
  } finally {
    await sleep(1000);
    hideModal(ModalType.loading);
  }
}
