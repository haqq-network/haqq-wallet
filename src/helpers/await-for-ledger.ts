import {ProviderInterface} from '@haqq/provider-base';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {hideModal, showModal} from '@app/helpers/modal';

import {awaitForBluetooth} from './await-for-bluetooth';

const LEDGER_PROVIDER_EVENTS = [
  'signTypedData',
  'signPersonalMessage',
  'signTransaction',
  'abortCall',
];

export const awaitForLedger = async (transport: ProviderInterface) => {
  await awaitForBluetooth();
  return new Promise<void>((resolve, reject) => {
    const done = (
      status: boolean,
      _message?: string,
      _name?: string,
      code?: string,
    ) => {
      app.off(Events.onCloseModal, onCloseModal);
      hideModal('ledgerAttention');
      LEDGER_PROVIDER_EVENTS.forEach(event => transport.off(event, done));
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

    LEDGER_PROVIDER_EVENTS.forEach(event => transport.on(event, done));
    app.on(Events.onCloseModal, onCloseModal);
    showModal('ledgerAttention');
  });
};
