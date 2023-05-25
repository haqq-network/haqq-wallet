import React, {useCallback, useEffect, useMemo} from 'react';

import {StyleSheet, View} from 'react-native';

import {
  ClaimOnMainNet,
  DetailsQrModal,
  ErrorAccountAdded,
  ErrorCreateAccount,
  ErrorModal,
  LedgerAttention,
  LedgerLocked,
  LedgerNoApp,
  LoadingModal,
  NoInternet,
  PinModal,
  QRModal,
  SplashModal,
} from '@app/components/modals';
import {BluetoothPoweredOff} from '@app/components/modals/bluetooth-powered-off';
import {BluetoothUnauthorized} from '@app/components/modals/bluetooth-unauthorized';
import {CaptchaModal} from '@app/components/modals/capthca-modal';
import {LocationUnauthorized} from '@app/components/modals/location-unauthorized';
import {ProvidersBottomSheet} from '@app/components/modals/providers-bottom-sheet';
import {TransactionError} from '@app/components/modals/transaction-error';
import {WalletsBottomSheet} from '@app/components/modals/wallets-bottom-sheet';
import {hideModal} from '@app/helpers';
import {Modals, ModalsListBase} from '@app/types';

export type ModalWrapperProps<
  ModalsList extends ModalsListBase,
  ModalName extends keyof ModalsList,
> = {
  type: Extract<ModalName, string>;
  modal: ModalsList[ModalName];
  onClose: (modal: Extract<ModalName, string>) => void;
};

export const ModalWrapper = ({
  type,
  modal,
  onClose,
}: ModalWrapperProps<Modals, any>) => {
  useEffect(() => {
    return () => {
      onClose(modal);
    };
  }, [modal, onClose]);

  const onCloseModalPress = useCallback(() => {
    modal.onClose?.();
    hideModal(type);
  }, [modal, type]);

  const entry = useMemo(() => {
    if (!modal) {
      return null;
    }
    switch (type) {
      case 'loading':
        return <LoadingModal {...modal} />;
      case 'pin':
        return <PinModal />;
      case 'splash':
        return <SplashModal />;
      case 'noInternet':
        return <NoInternet />;
      case 'bluetoothPoweredOff':
        return <BluetoothPoweredOff onClose={onCloseModalPress} />;
      case 'bluetoothUnauthorized':
        return <BluetoothUnauthorized onClose={onCloseModalPress} />;
      case 'qr':
        return <QRModal {...modal} onClose={onCloseModalPress} />;
      case 'cardDetailsQr':
        return <DetailsQrModal {...modal} onClose={onCloseModalPress} />;
      case 'error':
        return <ErrorModal {...modal} onClose={onCloseModalPress} />;
      case 'claimOnMainnet':
        return <ClaimOnMainNet {...modal} onClose={onCloseModalPress} />;
      case 'ledgerNoApp':
        return <LedgerNoApp {...modal} onClose={onCloseModalPress} />;
      case 'ledgerAttention':
        return <LedgerAttention onClose={onCloseModalPress} />;
      case 'ledgerLocked':
        return <LedgerLocked onClose={onCloseModalPress} />;
      case 'errorAccountAdded':
        return <ErrorAccountAdded onClose={onCloseModalPress} />;
      case 'errorCreateAccount':
        return <ErrorCreateAccount onClose={onCloseModalPress} />;
      case 'walletsBottomSheet':
        return <WalletsBottomSheet {...modal} onClose={onCloseModalPress} />;
      case 'transactionError':
        return <TransactionError {...modal} onClose={onCloseModalPress} />;
      case 'locationUnauthorized':
        return <LocationUnauthorized onClose={onCloseModalPress} />;
      case 'providersBottomSheet':
        return <ProvidersBottomSheet {...modal} onClose={onCloseModalPress} />;
      case 'captcha':
        return <CaptchaModal onClose={onCloseModalPress} />;
      default:
        return null;
    }
  }, [modal, onCloseModalPress, type]);

  return <View style={StyleSheet.absoluteFill}>{entry}</View>;
};
