import {app} from '@app/contexts';
import {Events} from '@app/events';
import {hideModal, showModal} from '@app/helpers/modal';

import {ProviderInterface} from '../../../provider-base';

export const awaitForLedger = (transport: ProviderInterface) => {
  return new Promise<void>((resolve, reject) => {
    const done = (status: boolean) => {
      hideModal();
      transport.abort();

      transport.off('signTypedData', done);
      app.off(Events.onCloseModal, onCloseModal);

      if (status) {
        resolve();
      } else {
        reject('err');
      }
    };

    const onCloseModal = () => {
      done(false);
    };

    transport.on('signTypedData', done);
    app.on(Events.onCloseModal, onCloseModal);

    showModal('ledger-attention');
  });
};
