import React, {useEffect, useMemo, useState} from 'react';
import {Modal} from 'react-native';
import {
  ConfirmationModal,
  ConfirmationModalProps,
  LoadingModal,
  LoadingModalProps,
  PinModal,
  PinModalProps,
  SplashModal,
  SplashModalProps,
} from '../components/modals';
import {useApp} from '../contexts/app';

type Loading = {
  type: 'loading';
} & LoadingModalProps;

type Confirmation = {
  type: 'confirmation';
} & Omit<ConfirmationModalProps, 'onClose'>;

type Splash = {
  type: 'splash' & SplashModalProps;
};

type Pin = {
  type: 'pin' & PinModalProps;
};

type ModalState = Loading | Confirmation | Splash | Pin | null;

export const Modals = () => {
  const app = useApp();
  const [modal, setModal] = useState<ModalState>(null);

  useEffect(() => {
    const subscription = (event: ModalState) => {
      setModal(event);
    };

    app.on('modal', subscription);

    return () => {
      app.off('modal', subscription);
    };
  }, [app]);

  const onClose = () => {
    setModal(null);
  };

  const entry = useMemo(() => {
    if (!modal) {
      return null;
    }
    switch (modal.type) {
      case 'confirmation':
        return <ConfirmationModal action={modal.action} onClose={onClose} />;
      case 'loading':
        return <LoadingModal text={modal.text} />;
      case 'pin':
        return <PinModal />;
      case 'splash':
        return <SplashModal />;
      default:
        return null;
    }
  }, [modal]);

  return (
    <Modal animationType="fade" visible={!!modal} transparent={true}>
      {entry}
    </Modal>
  );
};
