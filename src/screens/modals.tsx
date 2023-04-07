import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {Modal} from 'react-native';

import {
  ErrorAccountAdded,
  ErrorCreateAccount,
  LedgerAttention,
  LedgerLocked,
  LedgerNoApp,
  LedgerNoAppProps,
  LoadingModal,
  LoadingModalProps,
  NoInternet,
  PinModal,
  PinModalProps,
  RewardError,
  SplashModal,
  SplashModalProps,
} from '@app/components/modals';
import {
  BluetoothPoweredOff,
  BluetoothPoweredOffProps,
} from '@app/components/modals/bluetooth-powered-off';
import {
  BluetoothUnauthorized,
  BluetoothUnauthorizedProps,
} from '@app/components/modals/bluetooth-unauthorized';
import {
  CaptchaModal,
  CaptchaModalProps,
} from '@app/components/modals/capthca-modal';
import {
  DetailsQrModal,
  DetailsQrModalProps,
} from '@app/components/modals/details-qr';
import {
  LocationUnauthorized,
  LocationUnauthorizedProps,
} from '@app/components/modals/location-unauthorized';
import {
  ProvidersBottomSheet,
  ProvidersBottomSheetProps,
} from '@app/components/modals/providers-bottom-sheet';
import {QRModal, QRModalProps} from '@app/components/modals/qr';
import {
  TransactionError,
  TransactionErrorProps,
} from '@app/components/modals/transaction-error';
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

type LedgerNoAppModal = {
  type: 'ledger-no-app';
} & LedgerNoAppProps;

type TransactionErrorModal = {
  type: 'transaction-error';
} & TransactionErrorProps;

type BluetoothPoweredOffModal = {
  type: 'bluetooth-powered-off';
} & BluetoothPoweredOffProps;

type BluetoothUnauthorizedModal = {
  type: 'bluetooth-unauthorized';
} & BluetoothUnauthorizedProps;

type CaptchaModal = {
  type: 'captcha';
} & CaptchaModalProps;

type LocationUnauthorizedModal = {
  type: 'location-unauthorized';
} & LocationUnauthorizedProps;

type ProvidersBottomSheetModal = {
  type: 'providers-bottom-sheet';
} & ProvidersBottomSheetProps;

type ModalState =
  | Loading
  | Splash
  | Pin
  | QR
  | NoInternet
  | WalletsBottomSheetParams
  | DetailsQr
  | LedgerNoAppModal
  | TransactionErrorModal
  | BluetoothPoweredOffModal
  | BluetoothUnauthorizedModal
  | LocationUnauthorizedModal
  | CaptchaModal
  | ProvidersBottomSheetModal
  | null;

export type ModalProps = {
  initialModal?: ModalState;
};

export const Modals = ({initialModal = null}: ModalProps) => {
  const [modal, setModal] = useState<ModalState>(initialModal);

  useEffect(() => {
    const showModal = (event: ModalState) => {
      if (event && modal?.type !== event.type) {
        setModal(event);
      }
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
  }, [modal]);

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
      case 'providers-bottom-sheet':
        return <ProvidersBottomSheet {...modal} />;
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
      case 'ledger-no-app':
        return <LedgerNoApp onRetry={modal.onRetry} />;
      case 'transaction-error':
        return <TransactionError message={modal.message} />;
      case 'bluetooth-powered-off':
        return <BluetoothPoweredOff onClose={modal.onClose} />;
      case 'bluetooth-unauthorized':
        return <BluetoothUnauthorized onClose={modal.onClose} />;
      case 'location-unauthorized':
        return <LocationUnauthorized onClose={modal.onClose} />;
      case 'captcha':
        return <CaptchaModal onClose={modal.onClose} />;
      case 'reward-error':
        return <RewardError />;
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
