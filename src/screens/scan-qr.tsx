import React, {useCallback, useState} from 'react';
import {RNCamera} from 'react-native-camera';
import {Text} from 'react-native';

export const ScanQrScreen = () => {
  const [code, setCode] = useState('');

  const onSuccess = useCallback(
    e => {
      if (e.data && e.data !== code) {
        setCode(e.data);
      }
    },
    [code],
  );

  const onStatusChange = useCallback(e => {
    console.log('onStatusChange', e);
  }, []);

  return (
    <RNCamera
      style={{flex: 1}}
      captureAudio={false}
      type={RNCamera.Constants.Type.back}
      onBarCodeRead={onSuccess}
      flashMode={RNCamera.Constants.FlashMode.auto}
      onStatusChange={onStatusChange}>
      {code && <Text>{code}</Text>}
    </RNCamera>
  );
};
