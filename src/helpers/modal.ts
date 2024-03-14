import {makeAutoObservable} from 'mobx';
import {Keyboard} from 'react-native';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {ModalState} from '@app/screens/modals-screen';
import {Modals} from '@app/types';
import {makeID} from '@app/utils';

export type ModalName = Extract<keyof Modals, string>;

class ModalStore {
  modals: ModalState[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  isExist = (type: ModalName) => !!this.findByType(type);

  private findByType = (type: ModalName) =>
    this.modals.find(modal => modal.type === type);

  private removeByType = (type: ModalName) => {
    const filtered = this.modals.filter(modal => modal.type !== type);
    this.modals = filtered;
  };

  showModal = (type: ModalName, params: Modals[ModalName] = {}) => {
    // dismiss keyboard when modal is shown
    // in some cases, keyboard renders over the modal
    // and modal is not visible
    Keyboard.dismiss();
    const newModal: ModalState = {type, ...params, uid: makeID(6)};
    if (this.isExist(newModal.type)) {
      this.removeByType(newModal.type);
    }
    this.modals = [...this.modals, newModal];

    return () => this.hideModal(type);
  };

  hideModal = (type: ModalName) => {
    if (this.isExist(type)) {
      this.removeByType(type);
      app.emit(Events.onCloseModal, type);
    }
  };

  setCollapsed = (type: ModalName, collapsed: boolean) => {
    const modal = this.findByType(type);

    if (modal) {
      const newModals = this.modals.map(m => {
        if (m.uid === modal.uid) {
          return {
            ...m,
            collapsed,
          };
        }
        return m;
      });

      this.modals = [...newModals];
    }
  };
}

const instance = new ModalStore();

export const showModal = instance.showModal;
export const hideModal = instance.hideModal;
export const setCollapsedModal = instance.setCollapsed;
export {instance as ModalStore};
