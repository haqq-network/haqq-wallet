import {app} from '@app/contexts/app';
import {Modals} from '@app/types';

type ModalName = Extract<keyof Modals, string>;

export function showModal(
  modalName: ModalName,
  params: Modals[ModalName] = {},
) {
  app.emit('showModal', {type: modalName, ...params});

  return () => hideModal(modalName);
}

export function hideModal(modalName: ModalName) {
  app.emit('hideModal', {type: modalName});
}
