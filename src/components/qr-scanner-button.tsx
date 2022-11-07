import React, {useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {IconButton, QRScanner} from './ui';
import {GRAPHIC_BASE_1} from '../variables';
import {utils} from 'ethers';
import {useApp} from '../contexts/app';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types';
import {hideModal, showModal} from '../helpers/modal';

export const QrScannerButton = () => {
  const app = useApp();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const onPressQR = useCallback(() => {
    const subscription = (value: string) => {
      if (utils.isAddress(value.trim())) {
        hideModal();
        app.off('address', subscription);

        navigation.navigate('transaction', {
          to: value.trim(),
        });
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
