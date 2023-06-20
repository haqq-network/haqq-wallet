import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {StatusBar} from 'react-native';
import SystemNavigationBar from 'react-native-system-navigation-bar';

import {Modal} from '@app/components/modal';
import {ModalWrapper} from '@app/components/modals/modal-wrapper';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {Modals, ModalsListBase} from '@app/types';
import {makeID} from '@app/utils';
import {IS_ANDROID} from '@app/variables/common';

type ModalStates<
  ModalsList extends ModalsListBase,
  ModalName extends keyof ModalsList,
> = ModalsList[ModalName] & {type: ModalName; uid: string};

type ModalState = ModalStates<Modals, keyof Modals>;

export type ModalProps = {
  initialModal?: Partial<ModalState>;
};

export const ModalsScreen = ({initialModal}: ModalProps) => {
  const [modals, setModal] = useState<ModalState[]>(
    ([initialModal].filter(Boolean) as ModalState[]).map(m => ({
      ...m,
      uid: makeID(6),
    })),
  );

  const hasModals = useMemo(() => Boolean(modals.length), [modals.length]);

  useEffect(() => {
    if (hasModals) {
      SystemNavigationBar.navigationHide();
      StatusBar.setHidden(true);
      IS_ANDROID && StatusBar.setTranslucent(true);

      return () => {
        SystemNavigationBar.navigationShow();
        StatusBar.setHidden(false);
        IS_ANDROID && StatusBar.setTranslucent(false);
      };
    }
  }, [hasModals]);

  const onClose = useCallback((event: ModalState) => {
    app.emit(Events.onCloseModal, event.type);
  }, []);

  useEffect(() => {
    const showModal = (event: ModalState) => {
      let exists = modals.some(m => m.type === event.type);

      if (!exists) {
        setModal(m => m.concat({...event, uid: makeID(6)}));
      }
    };

    const hideModal = (event: {type: string}) => {
      let exists = modals.some(m => m.type === event.type);

      if (exists) {
        setModal(m => m.filter(r => r.type !== event.type));
      }
    };

    app.on('showModal', showModal);
    app.on('hideModal', hideModal);
    return () => {
      app.off('showModal', showModal);
      app.off('hideModal', hideModal);
    };
  }, [modals]);

  return (
    <Modal visible={!!modals.length}>
      {modals.map(modal => (
        <ModalWrapper
          type={modal.type}
          modal={modal}
          onClose={onClose}
          key={modal.uid}
        />
      ))}
    </Modal>
  );
};
