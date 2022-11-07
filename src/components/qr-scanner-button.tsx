import React, {useCallback} from 'react';

import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {utils} from 'ethers';

import {IconButton, QRScanner} from './ui';

import {Color, getColor} from '../colors';
import {useApp} from '../contexts/app';
import {createTheme} from '../helpers/create-theme';
import {hideModal, showModal} from '../helpers/modal';
import {RootStackParamList} from '../types';

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
      <QRScanner color={getColor(Color.graphicBase1)} />
    </IconButton>
  );
};

const page = createTheme({
  container: {marginRight: 12},
});
