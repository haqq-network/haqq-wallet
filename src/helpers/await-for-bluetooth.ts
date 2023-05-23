import {getBleManager} from '@haqq/provider-ledger-react-native';
import {State} from 'react-native-ble-plx';

import {hideModal, showModal} from '@app/helpers/modal';
import {Modals} from '@app/types';

type ModalName = Extract<keyof Modals, string>;

export const awaitForBluetooth = () => {
  return new Promise<void>((resolve, reject) => {
    let currentState = State.Unknown;
    let currentModal: ModalName | null = null;
    const manager = getBleManager();

    const onClose = () => {
      reject(new Error('bluetooth_popup_closed'));
    };

    manager.onStateChange((newState: State) => {
      if (newState !== currentState) {
        currentState = newState;
        switch (newState) {
          case State.PoweredOn:
            currentModal && hideModal(currentModal);
            resolve();
            return;
          case State.PoweredOff:
            if (currentModal !== 'bluetoothPoweredOff') {
              currentModal && hideModal(currentModal);
              currentModal = 'bluetoothPoweredOff';
              showModal('bluetoothPoweredOff', {onClose});
            }
            break;
          case State.Unauthorized:
            if (currentModal !== 'bluetoothUnauthorized') {
              currentModal && hideModal(currentModal);
              currentModal = 'bluetoothUnauthorized';
              showModal('bluetoothUnauthorized', {onClose});
            }
            break;
        }
      }
    }, true);
  });
};
