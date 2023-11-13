import React, {useCallback, useEffect, useMemo} from 'react';

import {StyleSheet, View, useWindowDimensions} from 'react-native';

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
import {CloudVerification} from '@app/components/modals/cloud-verification';
import {CloudShareNotFound} from '@app/components/modals/cloudShareNotFound';
import {LocationUnauthorized} from '@app/components/modals/location-unauthorized';
import {ProvidersBottomSheet} from '@app/components/modals/providers-bottom-sheet';
import {RaffleAgreement} from '@app/components/modals/raffle-agreement';
import {TransactionError} from '@app/components/modals/transaction-error';
import {ViewErrorDetails} from '@app/components/modals/view-error-details';
import {WalletsBottomSheet} from '@app/components/modals/wallets-bottom-sheet';
import {createTheme, hideModal} from '@app/helpers';
import {useTheme} from '@app/hooks';
import {ModalType, Modals, ModalsListBase} from '@app/types';

import {DomainBlocked} from './domain-blocked';
import {LockedTokensInfo} from './locked-tokens-info';
import {NotEnoughGas} from './not-enough-gas';

export type ModalWrapperProps<
  ModalsList extends ModalsListBase,
  ModalName extends keyof ModalsList,
> = {
  type: ModalName;
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

  const theme = useTheme();
  const dimensions = useWindowDimensions();

  const key = useMemo(
    () => `${theme}-${dimensions.width}-${dimensions.height}`,
    [dimensions, theme],
  );

  const entry = useMemo(() => {
    if (!modal) {
      return null;
    }
    switch (type) {
      case ModalType.loading:
        return <LoadingModal {...modal} />;
      case ModalType.pin:
        return <PinModal />;
      case ModalType.splash:
        return <SplashModal />;
      case ModalType.noInternet:
        return <NoInternet {...modal} />;
      case ModalType.bluetoothPoweredOff:
        return <BluetoothPoweredOff onClose={onCloseModalPress} />;
      case ModalType.bluetoothUnauthorized:
        return <BluetoothUnauthorized onClose={onCloseModalPress} />;
      case ModalType.qr:
        return <QRModal {...modal} onClose={onCloseModalPress} />;
      case ModalType.cardDetailsQr:
        return <DetailsQrModal {...modal} onClose={onCloseModalPress} />;
      case ModalType.error:
        return <ErrorModal {...modal} onClose={onCloseModalPress} />;
      case ModalType.claimOnMainnet:
        return <ClaimOnMainNet {...modal} onClose={onCloseModalPress} />;
      case ModalType.ledgerNoApp:
        return <LedgerNoApp {...modal} onClose={onCloseModalPress} />;
      case ModalType.ledgerAttention:
        return <LedgerAttention onClose={onCloseModalPress} />;
      case ModalType.ledgerLocked:
        return <LedgerLocked onClose={onCloseModalPress} />;
      case ModalType.errorAccountAdded:
        return <ErrorAccountAdded onClose={onCloseModalPress} />;
      case ModalType.errorCreateAccount:
        return <ErrorCreateAccount onClose={onCloseModalPress} />;
      case ModalType.walletsBottomSheet:
        return <WalletsBottomSheet {...modal} onClose={onCloseModalPress} />;
      case ModalType.transactionError:
        return <TransactionError {...modal} onClose={onCloseModalPress} />;
      case ModalType.locationUnauthorized:
        return <LocationUnauthorized onClose={onCloseModalPress} />;
      case ModalType.providersBottomSheet:
        return <ProvidersBottomSheet {...modal} onClose={onCloseModalPress} />;
      case ModalType.captcha:
        return <CaptchaModal onClose={modal.onClose} variant={modal.variant} />;
      case ModalType.domainBlocked:
        return <DomainBlocked {...modal} onClose={onCloseModalPress} />;
      case ModalType.raffleAgreement:
        return <RaffleAgreement {...modal} onClose={onCloseModalPress} />;
      case ModalType.lockedTokensInfo:
        return <LockedTokensInfo {...modal} onClose={onCloseModalPress} />;
      case ModalType.notEnoughGas:
        return <NotEnoughGas {...modal} onClose={onCloseModalPress} />;
      case ModalType.cloudVerification:
        return <CloudVerification {...modal} />;
      case ModalType.viewErrorDetails:
        return <ViewErrorDetails {...modal} onClose={onCloseModalPress} />;
      case ModalType.cloudShareNotFound:
        return <CloudShareNotFound {...modal} onClose={onCloseModalPress} />;
      default:
        return null;
    }
  }, [modal, onCloseModalPress, type]);

  return (
    <View
      key={key}
      style={[StyleSheet.absoluteFill, modal.collapsed && styles.collapsed]}>
      {entry}
    </View>
  );
};

const styles = createTheme({
  collapsed: {
    opacity: 0,
    height: 0,
    width: 0,
  },
});
