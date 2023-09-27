import React, {useCallback, useEffect} from 'react';

import {observer} from 'mobx-react';

import {Modal} from '@app/components/modal';
import {ModalWrapper} from '@app/components/modals/modal-wrapper';
import {ModalStore, hideModal, showModal} from '@app/helpers';
import {Modals, ModalsListBase} from '@app/types';

type ModalStates<
  ModalsList extends ModalsListBase,
  ModalName extends keyof ModalsList,
> = ModalsList[ModalName] & {type: ModalName; uid: string};

export type ModalState = ModalStates<Modals, keyof Modals>;

export type ModalProps = {
  initialModal?: {type: 'splash'};
};

export const ModalsScreen = observer(({initialModal}: ModalProps) => {
  useEffect(() => {
    if (initialModal?.type) {
      showModal(initialModal.type);
    }
  }, [initialModal]);

  const onClose = useCallback((event: ModalState) => {
    hideModal(event.type);
  }, []);

  return (
    <Modal visible={!!ModalStore.modals.length}>
      {ModalStore.modals.map(modal => (
        <ModalWrapper
          type={modal.type}
          modal={modal}
          onClose={onClose}
          key={modal.uid}
        />
      ))}
    </Modal>
  );
});
