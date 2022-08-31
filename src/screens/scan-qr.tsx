import React, {useCallback, useEffect, useState} from 'react';
import {
  BarCodeReadEvent,
  CameraStatus,
  RecordAudioPermissionStatus,
  RNCamera,
} from 'react-native-camera';
import {CompositeScreenProps} from '@react-navigation/native';
import {utils} from 'ethers';
import {app} from '../contexts/app';

type ScanQrScreenProp = CompositeScreenProps<any, any>;

export const ScanQrScreen = ({navigation, route}: ScanQrScreenProp) => {
  const [code, setCode] = useState('');

  const onSuccess = useCallback(
    (e: BarCodeReadEvent) => {
      if (e.data && e.data !== code) {
        setCode(e.data);
      }
    },
    [code],
  );

  useEffect(() => {
    if (code.startsWith('haqq:') && utils.isAddress(code.slice(5))) {
      app.emit('address', code.slice(5));
      navigation.goBack();
      return;
    }

    if (code.startsWith('etherium:') && utils.isAddress(code.slice(9))) {
      app.emit('address', code.slice(9));
      navigation.goBack();
      return;
    }
  }, [code, navigation]);

  const onStatusChange = useCallback(
    (e: {
      cameraStatus: keyof CameraStatus;
      recordAudioPermissionStatus: keyof RecordAudioPermissionStatus;
    }) => {
      console.log('onStatusChange', e);
    },
    [],
  );

  return (
    <RNCamera
      style={{flex: 1}}
      captureAudio={false}
      type={RNCamera.Constants.Type.back}
      onBarCodeRead={onSuccess}
      flashMode={RNCamera.Constants.FlashMode.auto}
      onStatusChange={onStatusChange}
    />
  );
};
