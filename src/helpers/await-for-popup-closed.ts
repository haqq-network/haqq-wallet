import {app} from '@app/contexts';
import {Events} from '@app/events';
import {showModal} from '@app/helpers/modal';

export const awaitForPopupClosed = (popup: string, params = {}) => {
  return new Promise<void>(resolve => {
    const onCloseModal = (screen: string) => {
      if (screen === popup) {
        resolve();
      }
    };

    app.on(Events.onCloseModal, onCloseModal);

    showModal(popup, params);
  });
};
