import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {URRegistryDecoder} from '@keystonehq/ur-decoder';
import _ from 'lodash';
import {Dimensions, StatusBar, View} from 'react-native';
import {BarCodeReadEvent} from 'react-native-camera';
// @ts-ignore
import {QRscanner} from 'react-native-qr-decode-image-camera';

import {Color, getColor} from '@app/colors';
import {First, Text} from '@app/components/ui';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {
  AwaitForScanQrError,
  AwaitForScanQrEvents,
  SCAN_QR_TASK_ID_LENGTH,
} from '@app/helpers/await-for-scan-qr';
import {useTheme} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {I18N, getText} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {SystemDialog} from '@app/services/system-dialog';
import {ModalType, Modals} from '@app/types';
import {IS_IOS, QR_STATUS_BAR, SUPPORTED_UR_TYPE} from '@app/variables/common';

import {QrNoAccess} from '../qr/qr-no-access';
import {QrTopView} from '../qr/qr-top-view';
export type KeystoneScannerModalProps = Modals[ModalType.keystoneScanner];

const debbouncedVibrate = _.debounce(vibrate, 1000);
const ERROR_RESET_TIMEOUT = 5000;

export const KeystoneScannerModal = ({
  purpose = 'sign',
  eventTaskId,
  onClose,
}: KeystoneScannerModalProps) => {
  const [urDecoder, setURDecoder] = useState(new URRegistryDecoder());
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const theme = useTheme();

  const expectedURTypes = useMemo(() => {
    if (purpose === 'sync') {
      return [SUPPORTED_UR_TYPE.CRYPTO_HDKEY, SUPPORTED_UR_TYPE.CRYPTO_ACCOUNT];
    }
    return [SUPPORTED_UR_TYPE.ETH_SIGNATURE];
  }, [purpose]);

  const isRequestFromEvent = useMemo(
    () =>
      typeof eventTaskId === 'string' &&
      eventTaskId?.length === SCAN_QR_TASK_ID_LENGTH,
    [eventTaskId],
  );

  const succesEventName = useMemo(
    () => `${AwaitForScanQrEvents.succes}:${eventTaskId}`,
    [eventTaskId],
  );
  const errorEventName = useMemo(
    () => `${AwaitForScanQrEvents.error}:${eventTaskId}`,
    [eventTaskId],
  );

  const emmitSucces = useCallback(
    (data: string) => {
      app.emit(succesEventName, data);
    },
    [succesEventName],
  );

  const emmitError = useCallback(
    (e?: string | AwaitForScanQrError) => {
      app.emit(errorEventName, e);
    },
    [errorEventName],
  );

  const handleError = useCallback((errString: I18N) => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    setError(getText(errString));
    debbouncedVibrate(HapticEffects.error);

    timeoutId.current = setTimeout(() => {
      setError('');
    }, ERROR_RESET_TIMEOUT);
  }, []);

  const onCloseWrapper = useCallback(() => {
    if (isRequestFromEvent) {
      const errorMessage = isAuthorized
        ? AwaitForScanQrError.getError()
        : AwaitForScanQrError.getCameraPermissionError();

      emmitError(errorMessage);
    }
    onClose?.();
  }, [emmitError, isAuthorized, isRequestFromEvent, onClose]);

  const onSuccess = useCallback(async (e: BarCodeReadEvent) => {
    try {
      const content = e.data?.trim?.();
      if (!content) {
        return;
      }
      urDecoder.receivePart(content);
      setProgress(Math.ceil(urDecoder.getProgress() * 100));
      if (urDecoder.isError()) {
        Logger.error(urDecoder.resultError());
        handleError(I18N.unknownQrCode);
      } else if (urDecoder.isSuccess()) {
        const ur = urDecoder.resultUR();
        if (expectedURTypes.includes(ur.type)) {
          const urCborHex = ur.cbor.toString('hex');
          emmitSucces(urCborHex);
          setProgress(0);
          setURDecoder(new URRegistryDecoder());
        } else if (purpose === 'sync') {
          handleError(I18N.invalidQrCodeSync);
        } else {
          handleError(I18N.invalidQrCodeSign);
        }
      }
    } catch (err) {
      handleError(I18N.unknownQrCode);
    }
  }, []);

  const renserNotAuthorizedView = useCallback(
    () => <QrNoAccess onClose={onCloseWrapper} />,
    [onCloseWrapper],
  );

  const renderTopView = useCallback(
    () => <QrTopView onClose={onCloseWrapper} />,
    [onCloseWrapper],
  );

  useEffectAsync(async () => {
    try {
      const result = await SystemDialog.requestCameraPermissions();
      Logger.log('Camera permission is authorized: ', result);
      setIsAuthorized(result);
    } catch (err) {
      setIsAuthorized(false);
    }

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

  useAndroidBackHandler(() => {
    onCloseWrapper();
    return true;
  }, [onCloseWrapper]);

  useEffect(() => {
    if (IS_IOS) {
      return;
    }

    StatusBar.setBackgroundColor(QR_STATUS_BAR);
    return () => {
      StatusBar.setBackgroundColor('transparent');
    };
  }, [theme]);

  if (!isAuthorized) {
    return renserNotAuthorizedView();
  }

  return (
    <>
      <QRscanner
        isRepeatScan={true}
        captureAudio={false}
        vibrate={false}
        style={styles.container}
        onRead={onSuccess}
        flashMode={false}
        hintText=""
        isShowScanBar={false}
        cornerColor={getColor(error ? Color.graphicRed1 : Color.graphicBase3)}
        cornerWidth={7}
        zoom={0}
        notAuthorizedView={renserNotAuthorizedView}
        renderTopView={renderTopView}
      />
      <View style={styles.bottomTextContainer}>
        <First>
          {!!error && (
            <View style={[styles.bottomError, styles.bottomTextWrapper]}>
              <Text t8 color={Color.textBase3} children={error} />
            </View>
          )}
          <View style={styles.bottomTextWrapper}>
            <First>
              <Text t8 color={Color.textBase3}>
                {getText(I18N.keystoneScannerScanning)}
                {progress > 0 ? ` ${progress}%` : ''}
              </Text>
            </First>
          </View>
        </First>
      </View>
    </>
  );
};

const styles = createTheme({
  container: {flex: 1},
  bottomTextWrapper: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  bottomError: {
    backgroundColor: Color.graphicRed1,
    borderRadius: 30,
  },
  bottomTextContainer: {
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Dimensions.get('window').height / 2 - 135,
  },
});
