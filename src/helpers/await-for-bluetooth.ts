import {getBleManager} from '@haqq/provider-ledger-react-native';
import {State} from 'react-native-ble-plx';

import {hideModal, showModal} from '@app/helpers/modal';

export const awaitForBluetooth = () => {
  return new Promise<void>((resolve, reject) => {
    let currentState = State.Unknown;
    let currentModal: string | null = null;
    const manager = getBleManager();

    const onClose = () => {
      reject(new Error('bluetooth_popup_closed'));
    };

    manager.onStateChange((newState: State) => {
      if (newState !== currentState) {
        currentState = newState;
        switch (newState) {
          case State.PoweredOn:
            hideModal(currentModal);
            resolve();
            return;
          case State.PoweredOff:
            if (currentModal !== 'bluetooth-powered-off') {
              currentModal = 'bluetooth-powered-off';
              showModal('bluetooth-powered-off', {onClose});
            }
            break;
          case State.Unauthorized:
            if (currentModal !== 'bluetooth-unauthorized') {
              currentModal = 'bluetooth-unauthorized';
              showModal('bluetooth-unauthorized', {onClose});
            }
            break;
        }
      }
    }, true);
  });
};
