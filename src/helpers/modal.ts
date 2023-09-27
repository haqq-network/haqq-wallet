import {makeAutoObservable} from 'mobx';

import {ModalState} from '@app/screens/modals-screen';
import {Modals} from '@app/types';
import {makeID} from '@app/utils';

export type ModalName = Extract<keyof Modals, string>;

class ModalStore {
  modals: ModalState[] = [];
  constructor() {
    makeAutoObservable(this);
  }

  private isExist = (type: ModalName) => !!this.findByType(type);

  private findByType = (type: ModalName) =>
    this.modals.find(modal => modal.type === type);

  private removeByType = (type: ModalName) => {
    const filtered = this.modals.filter(modal => modal.type !== type);
    this.modals = filtered;
  };

  showModal = (type: ModalName, params: Modals[ModalName] = {}) => {
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
    }
  };
}

const instance = new ModalStore();

export const showModal = instance.showModal;
export const hideModal = instance.hideModal;
export {instance as ModalStore};
