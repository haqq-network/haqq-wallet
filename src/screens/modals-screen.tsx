import React, {memo, useCallback, useEffect, useState} from 'react';

import {createNavigationContainerRef} from '@react-navigation/native';

import {Modal} from '@app/components/modal';
import {ModalWrapper} from '@app/components/modals/modal-wrapper';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {useTypedRoute} from '@app/hooks';
import {
  WelcomeStackParamList,
  WelcomeStackRoutes,
} from '@app/screens/WelcomeStack';
import {Modals, ModalsListBase} from '@app/types';
import {makeID} from '@app/utils';

type ModalStates<
  ModalsList extends ModalsListBase,
  ModalName extends keyof ModalsList,
> = ModalsList[ModalName] & {type: ModalName; uid: string};

export type ModalState = ModalStates<Modals, keyof Modals>;

export type ModalProps = {
  initialModal?: Partial<ModalState>;
  route?: ModalState;
};

export const ModalsScreen = ({initialModal, route}: ModalProps) => {
  const [modals, setModal] = useState<ModalState[]>(
    ([initialModal].filter(Boolean) as ModalState[]).map(m => ({
      ...m,
      uid: makeID(6),
    })),
  );

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
      const navigationRef = createNavigationContainerRef();
      navigationRef.goBack();
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

  useEffect(() => {
    if (route) {
      setModal([route]);
    }
  }, [route]);

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

export const ModalsScreenConnected = memo(() => {
  const route = useTypedRoute<WelcomeStackParamList, WelcomeStackRoutes.Modal>()
    .params;
  return <ModalsScreen route={route} />;
});
