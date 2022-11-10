import React, {useCallback} from 'react';

import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {utils} from 'ethers';
import {StyleSheet} from 'react-native';

import {IconButton, QRScanner} from './ui';

import {useApp} from '../contexts/app';
import {hideModal, showModal} from '../helpers/modal';
import {RootStackParamList} from '../types';
import {GRAPHIC_BASE_1} from '../variables';

export const QrScannerButton = () => {
  const app = useApp();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const onPressQR = useCallback(() => {
    const subscription = ({from, to}: any) => {
      if (utils.isAddress(to)) {
        app.off('address', subscription);
        hideModal();
        navigation.navigate('transaction', {to, from});
      }
    };

    app.on('address', subscription);
    showModal('qr');
  }, [app, navigation]);

  return (
    <IconButton onPress={onPressQR} style={page.container}>
      <QRScanner color={GRAPHIC_BASE_1} />
    </IconButton>
  );
};

const page = StyleSheet.create({
  container: {marginRight: 12},
});
