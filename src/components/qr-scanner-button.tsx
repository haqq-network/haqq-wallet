import React from 'react';
import { IconButton, QRScanner } from './ui';
import { useNavigationContainerRef } from '@react-navigation/native';
import { GRAPHIC_BASE_1 } from '../variables';
import { RootStackParamList } from '../types';

export const QrScannerButton = () => {
  const navigator = useNavigationContainerRef<RootStackParamList>();
  return (
    <IconButton
      onPress={() => {
        navigator.navigate('scanQr');
      }}
      style={{ marginRight: 12 }}>
      <QRScanner color={GRAPHIC_BASE_1} />
    </IconButton>
  );
};
