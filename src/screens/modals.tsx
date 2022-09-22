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
import {QRModal, QRModalProps} from '../components/modals/qr';

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

type QR = {
  type: 'qr' & QRModalProps;
};

type ModalState = Loading | Confirmation | Splash | Pin | QR | null;

export type ModalProps = {
  initialModal?: ModalState;
};

export const Modals = ({initialModal = null}: ModalProps) => {
  const app = useApp();
  const [modal, setModal] = useState<ModalState>(initialModal);

  useEffect(() => {
    const subscription = (event: ModalState) => {
      setModal(event);
      console.log('modal', JSON.stringify(event));
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
      case 'qr':
        return <QRModal onClose={onClose} />;
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
