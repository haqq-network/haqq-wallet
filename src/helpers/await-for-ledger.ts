import {ProviderInterface} from '@haqq/provider-base';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {hideModal, showModal} from '@app/helpers/modal';

export const awaitForLedger = (transport: ProviderInterface) => {
  return new Promise<void>((resolve, reject) => {
    const done = (status: boolean) => {
      app.off(Events.onCloseModal, onCloseModal);
      hideModal();
      transport.off('signTypedData', done);
      transport.abort();
      if (status) {
        resolve();
      } else {
        reject('err');
      }
    };

    const onCloseModal = (modal: string) => {
      if (modal === 'ledger-attention') {
        done(false);
      }
    };

    transport.on('signTypedData', done);
    app.on(Events.onCloseModal, onCloseModal);

    showModal('ledger-attention');
  });
};
