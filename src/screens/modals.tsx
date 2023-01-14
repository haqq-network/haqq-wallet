import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {Modal} from 'react-native';

import {
  ErrorAccountAdded,
  ErrorCreateAccount,
  LedgerAttention,
  LedgerLocked,
  LoadingModal,
  LoadingModalProps,
  NoInternet,
  PinModal,
  PinModalProps,
  SplashModal,
  SplashModalProps,
} from '@app/components/modals';
import {
  DetailsQrModal,
  DetailsQrModalProps,
} from '@app/components/modals/details-qr';
import {QRModal, QRModalProps} from '@app/components/modals/qr';
import {
  WalletsBottomSheet,
  WalletsBottomSheetProps,
} from '@app/components/modals/wallets-bottom-sheet';
import {app} from '@app/contexts';
import {Events} from '@app/events';

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

type WalletsBottomSheetParams = {
  type?: 'wallets-bottom-sheet';
} & WalletsBottomSheetProps;

type DetailsQr = {
  type: 'card-details-qr';
} & DetailsQrModalProps;

type ModalState =
  | Loading
  | Splash
  | Pin
  | QR
  | NoInternet
  | WalletsBottomSheetParams
  | DetailsQr
  | null;

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

  const onClose = useCallback(() => {
    setModal(null);
  }, []);

  useEffect(() => {
    return () => {
      app.emit(Events.onCloseModal, modal?.type);
    };
  }, [modal?.type]);

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
          <QRModal onClose={onClose} qrWithoutFrom={modal.qrWithoutFrom} />
        );
      case 'wallets-bottom-sheet':
        const props = {...modal};
        delete props.type;
        return <WalletsBottomSheet {...props} />;
      case 'card-details-qr':
        return <DetailsQrModal address={modal.address} />;
      case 'no-internet':
        return <NoInternet />;
      case 'error-account-added':
        return <ErrorAccountAdded />;
      case 'error-create-account':
        return <ErrorCreateAccount />;
      case 'ledger-attention':
        return <LedgerAttention onClose={onClose} />;
      case 'ledger-locked':
        return <LedgerLocked onClose={onClose} />;
      default:
        return null;
    }
  }, [modal, onClose]);

  return (
    <Modal animationType="none" visible={!!modal} transparent={true}>
      {entry}
    </Modal>
  );
};
