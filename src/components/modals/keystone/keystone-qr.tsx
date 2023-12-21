import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {UR, UREncoder} from '@ngraveio/bc-ur';
import {View, useWindowDimensions} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import {Color} from '@app/colors';
import {BottomPopupContainer} from '@app/components/bottom-popups';
import {Button, ButtonVariant, Spacer, Text} from '@app/components/ui';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {AwaitForQRSignError} from '@app/helpers/await-for-qr-sign';
import {
  QRScannerTypeEnum,
  awaitForScanQr,
} from '@app/helpers/await-for-scan-qr';
import {I18N} from '@app/i18n';
import {ModalType, Modals} from '@app/types';

type Props = Modals[ModalType.keystoneQR];

const QR_CODE_SIZE = 250;
const MAX_FRAGMENT_LENGTH_BYTES = 500;
const QR_CHANGE_INTERVAL_MS = 100;
const QR_FILL_COLOR = '#000000';
const QR_BG_COLOR = '#ffffff';

export const KeystoneQRModal = ({
  cborHex,
  urType,
  requestID,
  errorEventName,
  succesEventName,
  onClose,
}: Props) => {
  const {width} = useWindowDimensions();

  const urEncoder = useMemo(
    () =>
      new UREncoder(
        new UR(Buffer.from(cborHex, 'hex'), urType),
        MAX_FRAGMENT_LENGTH_BYTES,
      ),
    [cborHex, urType],
  );

  const [currentQRCode, setCurrentQRCode] = useState(urEncoder.nextPart());

  const emmitSucces = useCallback(
    (data: string) => {
      app.emit(succesEventName, data);
      onClose?.();
    },
    [succesEventName, onClose],
  );

  const emmitError = useCallback(
    (e?: string | AwaitForQRSignError) => {
      app.emit(errorEventName, e);
      onClose?.();
    },
    [errorEventName, onClose],
  );

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentQRCode(urEncoder.nextPart()?.toUpperCase?.());
    }, QR_CHANGE_INTERVAL_MS);
    return () => {
      clearInterval(id);
    };
  }, [urEncoder]);

  const onPressGetSignature = useCallback(
    async (onCloseWrapper: Function) => {
      try {
        const signatureHex = await awaitForScanQr({
          variant: QRScannerTypeEnum.keystone,
          eventTaskId: requestID,
          purpose: 'sign',
        });
        emmitSucces(signatureHex);
      } catch (e) {
        emmitError(e as Error);
      } finally {
        onCloseWrapper?.();
      }
    },
    [emmitSucces, emmitError, requestID],
  );

  const onPressClose = useCallback(
    (onCloseWrapper: Function) => {
      emmitError(AwaitForQRSignError.getError());
      onCloseWrapper?.();
    },
    [emmitError],
  );

  return (
    <BottomPopupContainer>
      {onCloseModal => (
        <View style={styles.wrapper}>
          <Text
            t9
            center
            i18n={I18N.keystoneConnectionStepNumber}
            i18params={{idx: '1'}}
          />
          <Text center t11 i18n={I18N.keystoneQrStep1} />
          <Spacer height={12} />
          <View style={styles.qrWrapper}>
            <QRCode
              ecl={'H'}
              logo={require('@assets/images/qr-logo.png')}
              logoSize={width / 5.86}
              logoBorderRadius={8}
              value={currentQRCode.toUpperCase()}
              size={QR_CODE_SIZE}
              color={QR_FILL_COLOR}
              backgroundColor={QR_BG_COLOR}
            />
          </View>
          <Spacer height={12} />
          <Text
            t9
            center
            i18n={I18N.keystoneConnectionStepNumber}
            i18params={{idx: '2'}}
          />
          <Text t11 center i18n={I18N.keystoneQrStep2} />

          <Spacer height={40} />

          <View style={styles.buttonsWrapper}>
            <Button
              i18n={I18N.keystoneQrGetSignature}
              variant={ButtonVariant.contained}
              onPress={() => onPressGetSignature(onCloseModal)}
            />
            <Spacer height={8} />
            <Button
              i18n={I18N.keystoneQrClose}
              onPress={() => onPressClose(onCloseModal)}
            />
          </View>
        </View>
      )}
    </BottomPopupContainer>
  );
};

const styles = createTheme({
  wrapper: {
    alignItems: 'center',
    backgroundColor: Color.bg1,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 40,
    padding: 24,
  },
  buttonsWrapper: {
    width: '100%',
  },
  qrWrapper: {
    backgroundColor: QR_BG_COLOR,
    padding: 6,
    borderRadius: 8,
  },
});
