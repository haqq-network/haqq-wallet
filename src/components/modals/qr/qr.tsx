import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import _ from 'lodash';
import {Dimensions, StatusBar, View} from 'react-native';
import {BarCodeReadEvent} from 'react-native-camera';
import {launchImageLibrary} from 'react-native-image-picker';
// @ts-ignore
import {QRreader, QRscanner} from 'react-native-qr-decode-image-camera';

import {Text} from '@app/components/ui';
import {app} from '@app/contexts';
import {onDeepLink} from '@app/event-actions/on-deep-link';
import {createTheme, setCollapsedModal} from '@app/helpers';
import {
  AwaitForScanQrError,
  AwaitForScanQrEvents,
  SCAN_QR_TASK_ID_LENGTH,
} from '@app/helpers/await-for-scan-qr';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {SystemDialog} from '@app/services/system-dialog';
import {Color, Theme, getColor} from '@app/theme';
import {ModalType, Modals} from '@app/types';
import {isError} from '@app/utils';
import {IS_IOS, QR_STATUS_BAR} from '@app/variables/common';

import {QrBottomView} from './qr-bottom-view';
import {QrNoAccess} from './qr-no-access';
import {QrTopView} from './qr-top-view';

export type QRModalProps = Modals[ModalType.qr];

const debbouncedVibrate = _.debounce(vibrate, 1000);

const ERROR_RESET_TIMEOUT = 5000;

export const QRModal = ({onClose, eventTaskId, pattern}: QRModalProps) => {
  const [code, setCode] = useState('');
  const isProcessing = useRef(false);

  const [error, setError] = useState(false);
  const [flashMode, setFlashMode] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

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

  const onCloseWrapper = useCallback(() => {
    if (isRequestFromEvent) {
      const errorMessage = isAuthorized
        ? AwaitForScanQrError.getError()
        : AwaitForScanQrError.getCameraPermissionError();

      emmitError(errorMessage);
    }
    onClose?.();
  }, [emmitError, isAuthorized, isRequestFromEvent, onClose]);

  const handleError = useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    setError(true);
    debbouncedVibrate(HapticEffects.error);

    timeoutId.current = setTimeout(() => {
      setError(false);
    }, ERROR_RESET_TIMEOUT);
  }, []);

  const handleQRData = useCallback(
    async (data: string) => {
      vibrate(HapticEffects.selection);
      // Logger.log('qr raw string: ', data);

      if (typeof pattern === 'string') {
        try {
          const regex = new RegExp(pattern);
          if (!regex.test(data)) {
            return handleError();
          }
        } catch (err) {
          if (isError(err)) {
            emmitError(err);
          }
        }
      }

      if (isRequestFromEvent) {
        return emmitSucces(data);
      }

      setCode(data);
      const isUrlHandled = await onDeepLink(data);

      if (isUrlHandled) {
        onCloseWrapper();
      } else {
        handleError();
      }
    },
    [
      pattern,
      isRequestFromEvent,
      handleError,
      emmitError,
      emmitSucces,
      onCloseWrapper,
    ],
  );

  const onSuccess = useCallback(
    async (e: BarCodeReadEvent) => {
      const newCode = e.data?.trim?.();
      if (!isProcessing.current && e.data && newCode !== code) {
        isProcessing.current = true;
        try {
          await handleQRData(newCode);
        } finally {
          isProcessing.current = false;
        }
      }
    },
    [code, handleQRData],
  );

  const onClickGallery = useCallback(async () => {
    setCollapsedModal(ModalType.qr, true);
    const response = await launchImageLibrary({mediaType: 'photo'});
    if (response.assets && response.assets.length) {
      const first = response.assets[0];
      if (first.uri) {
        try {
          const data = await QRreader(first.uri);
          await handleQRData(data);
        } catch (err) {
          Logger.log(err);
        }
      }
    }
    setCollapsedModal(ModalType.qr, false);
  }, [handleQRData]);

  const onToggleFlashMode = useCallback(() => {
    setFlashMode(pr => !pr);
    vibrate(HapticEffects.impactLight);
  }, []);

  const renserNotAuthorizedView = useCallback(
    () => <QrNoAccess onClose={onCloseWrapper} />,
    [onCloseWrapper],
  );

  const renderTopView = useCallback(
    () => <QrTopView onClose={onCloseWrapper} />,
    [onCloseWrapper],
  );

  const renderBottomView = useCallback(
    () => (
      <QrBottomView
        flashMode={flashMode}
        onClickGallery={onClickGallery}
        onToggleFlashMode={onToggleFlashMode}
      />
    ),
    [flashMode, onClickGallery, onToggleFlashMode],
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
  }, [Theme.currentTheme]);

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
        flashMode={flashMode}
        hintText=""
        isShowScanBar={false}
        cornerColor={getColor(error ? Color.graphicRed1 : Color.graphicBase3)}
        cornerWidth={7}
        zoom={0}
        notAuthorizedView={renserNotAuthorizedView}
        renderTopView={renderTopView}
        renderBottomView={renderBottomView}
      />
      {error && (
        <View style={styles.bottomErrorContainer}>
          <View style={styles.bottomError}>
            <Text t8 color={Color.textBase3} i18n={I18N.qrModalInvalidCode} />
          </View>
        </View>
      )}
    </>
  );
};

const styles = createTheme({
  container: {flex: 1},
  bottomError: {
    backgroundColor: Color.graphicRed1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
  },
  bottomErrorContainer: {
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Dimensions.get('window').height / 2 - 135,
  },
});
