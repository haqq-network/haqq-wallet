import React, {useCallback, useEffect, useRef, useState} from 'react';

import _ from 'lodash';
import {Dimensions, StatusBar, View} from 'react-native';
import {BarCodeReadEvent} from 'react-native-camera';
import {launchImageLibrary} from 'react-native-image-picker';
// @ts-ignore
import {QRreader, QRscanner} from 'react-native-qr-decode-image-camera';

import {Color, getColor} from '@app/colors';
import {Text} from '@app/components/ui';
import {onDeepLink} from '@app/event-actions/on-deep-link';
import {createTheme} from '@app/helpers';
import {useTheme} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {SystemDialog} from '@app/services/system-dialog';
import {Modals} from '@app/types';
import {IS_IOS, QR_STATUS_BAR} from '@app/variables/common';

import {QrBottomView} from './qr-bottom-view';
import {QrNoAccess} from './qr-no-access';
import {QrTopView} from './qr-top-view';

export type QRModalProps = Modals['qr'];

const debbouncedVibrate = _.debounce(vibrate, 1000);

export const QRModal = ({onClose = () => {}, qrWithoutFrom}: QRModalProps) => {
  const [code, setCode] = useState('');
  const isProcessing = useRef(false);

  const [error, setError] = useState(false);
  const [flashMode, setFlashMode] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    SystemDialog.requestCameraPermissions().then(result => {
      Logger.log('Camera permission is authorized: ', result);
      setIsAuthorized(result);
    });
  }, []);

  useAndroidBackHandler(() => {
    onClose();
    return true;
  }, [onClose]);

  useEffect(() => {
    if (IS_IOS) {
      return;
    }

    StatusBar.setBackgroundColor(QR_STATUS_BAR);
    return () => {
      StatusBar.setBackgroundColor('transparent');
    };
  }, [theme]);

  const handleQRData = useCallback(
    async (data: string) => {
      vibrate(HapticEffects.selection);
      setCode(data);

      Logger.log(data);

      const isUrlHandled = await onDeepLink(data, qrWithoutFrom);

      if (isUrlHandled) {
        onClose();
      } else {
        setError(true);
        debbouncedVibrate(HapticEffects.error);
        setTimeout(() => {
          setError(false);
        }, 5000);
      }
    },
    [onClose, qrWithoutFrom],
  );

  const onSuccess = useCallback(
    async (e: BarCodeReadEvent) => {
      const newCode = e.data?.trim?.()?.toLowerCase?.();
      const currentCode = code?.trim?.()?.toLowerCase?.();
      if (!isProcessing.current && e.data && newCode !== currentCode) {
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
  }, [handleQRData]);

  const onToggleFlashMode = useCallback(() => {
    setFlashMode(pr => !pr);
    vibrate(HapticEffects.impactLight);
  }, []);

  const renserNotAuthorizedView = useCallback(
    () => <QrNoAccess onClose={onClose} />,
    [onClose],
  );

  const renderTopView = useCallback(
    () => <QrTopView onClose={onClose} />,
    [onClose],
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
