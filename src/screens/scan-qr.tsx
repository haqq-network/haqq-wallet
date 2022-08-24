import React, { useCallback, useState } from 'react';
import { BarCodeReadEvent, CameraStatus, RecordAudioPermissionStatus, RNCamera, } from 'react-native-camera';
import { Text } from 'react-native';

export const ScanQrScreen = () => {
  const [code, setCode] = useState('');

  const onSuccess = useCallback(
    (e: BarCodeReadEvent) => {
      if (e.data && e.data !== code) {
        setCode(e.data);
      }
    },
    [code],
  );

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
      style={{ flex: 1 }}
      captureAudio={false}
      type={RNCamera.Constants.Type.back}
      onBarCodeRead={onSuccess}
      flashMode={RNCamera.Constants.FlashMode.auto}
      onStatusChange={onStatusChange}>
      {code && <Text>{code}</Text>}
    </RNCamera>
  );
};
