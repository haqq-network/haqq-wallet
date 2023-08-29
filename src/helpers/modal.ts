import {createNavigationContainerRef} from '@react-navigation/native';

import {app} from '@app/contexts/app';
import {Modals} from '@app/types';
import {makeID} from '@app/utils';
import {MODAL_SCREEN_NAME} from '@app/variables/common';

type ModalName = Extract<keyof Modals, string>;

class ModalController {
  private navigationInstance: ReturnType<typeof createNavigationContainerRef>;

  init = () => {
    const navigation = createNavigationContainerRef();
    this.navigationInstance = navigation;
  };

  isReady = () => {
    return (
      this.navigationInstance.isReady() &&
      this.navigationInstance?.current?.getRootState?.() !== undefined
    );
  };

  showModal = (modalName: ModalName, params: Modals[ModalName] = {}) => {
    if (!this.navigationInstance) {
      return () => {};
    }
    app.emit('showModal', {type: modalName, ...params});
    if (this.isReady()) {
      //@ts-ignore
      this.navigationInstance.navigate(MODAL_SCREEN_NAME, {
        type: modalName,
        uid: makeID(6),
        ...params,
      });
    }

    return () => hideModal(modalName);
  };

  hideModal = (modalName: ModalName) => {
    if (!this.navigationInstance) {
      return;
    }
    app.emit('hideModal', {type: modalName});
    if (this.isReady()) {
      this.navigationInstance.goBack();
    }
  };
}

const instance = new ModalController();

export const showModal = instance.showModal;
export const hideModal = instance.hideModal;
export {instance as ModalController};
