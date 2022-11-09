import React, {useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {utils} from 'ethers';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useApp} from '../contexts/app';
import {LIGHT_GRAPHIC_BASE_1} from '../variables';
import {RootStackParamList} from '../types';
import {hideModal, showModal} from '../helpers/modal';
import {IconButton, QRScanner} from './ui';

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
      <QRScanner color={LIGHT_GRAPHIC_BASE_1} />
    </IconButton>
  );
};

const page = StyleSheet.create({
  container: {marginRight: 12},
});
