import {parseUri} from '@walletconnect/utils';

import {showModal} from '@app/helpers';
import {I18N} from '@app/i18n';
import {sendNotification} from '@app/services';
import {WalletConnect} from '@app/services/wallet-connect';
import {ModalType} from '@app/types';
import {sleep} from '@app/utils';

export async function onWalletConnectUri(uri: string) {
  const hideModal = showModal(ModalType.loading);
  try {
    const {version} = parseUri(uri);
    if (version === 1) {
      return sendNotification(I18N.walletConnectNotSupported);
    }
    sendNotification(I18N.walletConnectPairPending);
    await WalletConnect.instance.pair(uri);
  } finally {
    await sleep(1000);
    hideModal();
  }
}
