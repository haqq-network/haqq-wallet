import {ProviderInterface} from '@haqq/provider-base';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {hideModal, showModal} from '@app/helpers/modal';

export const awaitForLedger = (transport: ProviderInterface) => {
  return new Promise<void>((resolve, reject) => {
    const done = (
      status: boolean,
      _message?: string,
      _name?: string,
      code?: string,
    ) => {
      app.off(Events.onCloseModal, onCloseModal);
      hideModal('ledgerAttention');
      transport.off('signTypedData', done);
      transport.abort();
      if (status) {
        resolve();
      } else {
        reject(code ?? 'err');
      }
    };

    const onCloseModal = async (modal: string) => {
      if (modal === 'ledgerAttention') {
        done(false, '', '', '27013');
      }
    };

    transport.on('signTypedData', done);
    app.on(Events.onCloseModal, onCloseModal);

    showModal('ledgerAttention');
  });
};
