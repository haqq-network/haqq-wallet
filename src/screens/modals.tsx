import React, {useEffect, useMemo, useState} from 'react';

import {Modal} from 'react-native';

import {
  ErrorAccountAdded,
  ErrorCreateAccount,
  LoadingModal,
  LoadingModalProps,
  PinModal,
  PinModalProps,
  SplashModal,
  SplashModalProps,
} from '../components/modals';
import {NoInternet} from '../components/modals';
import {QRModal, QRModalProps} from '../components/modals/qr';
import {app} from '../contexts/app';

type Loading = {
  type: 'loading';
} & LoadingModalProps;

type Splash = {
  type: 'splash';
} & SplashModalProps;

type Pin = {
  type: 'pin';
} & PinModalProps;

type QR = {
  type: 'qr';
} & QRModalProps;

type NoInternet = {
  type: 'qr' & QRModalProps;
} & QRModalProps;

type ModalState = Loading | Splash | Pin | QR | NoInternet | null;

export type ModalProps = {
  initialModal?: ModalState;
};

export const Modals = ({initialModal = null}: ModalProps) => {
  const [modal, setModal] = useState<ModalState>(initialModal);

  useEffect(() => {
    const showModal = (event: ModalState) => {
      setModal(event);
      console.log('modal', JSON.stringify(event));
    };

    const hideModal = (event: {type: string | null}) => {
      setModal((currentModal: ModalState) => {
        if (!event.type || event.type === currentModal?.type) {
          return null;
        }

        return currentModal;
      });
    };

    app.on('modal', showModal);
    app.on('showModal', showModal);
    app.on('hideModal', hideModal);
    return () => {
      app.off('modal', showModal);
      app.off('showModal', showModal);
      app.off('hideModal', hideModal);
    };
  }, []);

  const onClose = () => {
    setModal(null);
  };

  const entry = useMemo(() => {
    if (!modal) {
      return null;
    }
    switch (modal.type) {
      case 'loading':
        return <LoadingModal text={modal.text} />;
      case 'pin':
        return <PinModal />;
      case 'splash':
        return <SplashModal />;
      case 'qr':
        return (
          <QRModal
            onClose={onClose || modal.onClose}
            qrWithoutFrom={modal.qrWithoutFrom}
          />
        );
      case 'no-internet':
        return <NoInternet />;
      case 'error-account-added':
        return <ErrorAccountAdded />;
      case 'error-create-account':
        return <ErrorCreateAccount />;
      default:
        return null;
    }
  }, [modal]);

  return (
    <Modal animationType="none" visible={!!modal} transparent={true}>
      {entry}
    </Modal>
  );
};
