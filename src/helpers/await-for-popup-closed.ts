import {app} from '@app/contexts';
import {Events} from '@app/events';
import {showModal} from '@app/helpers/modal';
import {Modals} from '@app/types';

type ModalName = Extract<keyof Modals, string>;

export const awaitForPopupClosed = (
  popup: ModalName,
  params: Modals[ModalName] = {},
) => {
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
