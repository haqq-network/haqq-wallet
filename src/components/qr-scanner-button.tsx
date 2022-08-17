import React from 'react';
import {IconButton, QRScanner} from './ui';
import {useNavigation} from '@react-navigation/native';
import {GRAPHIC_BASE_1} from '../variables';

export const QrScannerButton = () => {
  const navigation = useNavigation();
  return (
    <IconButton
      onPress={() => {
        navigation.navigate('scan-qr');
      }}
      style={{marginRight: 12}}>
      <QRScanner color={GRAPHIC_BASE_1} />
    </IconButton>
  );
};
