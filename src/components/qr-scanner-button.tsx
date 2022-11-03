import React, {useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {IconButton, QRScanner} from './ui';
import {GRAPHIC_BASE_1} from '../variables';
import {useApp} from '../contexts/app';

export const QrScannerButton = () => {
  const app = useApp();

  const onPressQR = useCallback(() => {
    app.emit('modal', {type: 'qr'});
  }, [app]);

  return (
    <IconButton onPress={onPressQR} style={page.container}>
      <QRScanner color={GRAPHIC_BASE_1} />
    </IconButton>
  );
};

const page = StyleSheet.create({
  container: {marginRight: 12},
});
