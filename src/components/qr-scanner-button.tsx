import React from 'react';
import {IconButton, QRScanner} from './ui';
import {useNavigation} from '@react-navigation/native';

export const QrScannerButton = () => {
  const navigation = useNavigation();
  return (
    <IconButton
      onPress={() => {
        navigation.navigate('scan-qr');
      }}
      style={{marginRight: 12}}>
      <QRScanner color="#2F2F2F" />
    </IconButton>
  );
};
