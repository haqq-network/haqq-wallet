import React, {useCallback} from 'react';

import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {StyleSheet} from 'react-native';

import {Color} from '@app/colors';
import {Icon, IconButton} from '@app/components/ui';
import {app} from '@app/contexts';
import {hideModal, showModal} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {ModalType, RootStackParamList} from '@app/types';

export const QrScannerButton = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const onPressQR = useCallback(() => {
    const subscription = ({from, to}: any) => {
      if (AddressUtils.isEthAddress(to)) {
        app.off('address', subscription);
        hideModal(ModalType.qr);
        navigation.navigate('transaction', {to, from});
      }
    };

    app.on('address', subscription);
    showModal(ModalType.qr);
  }, [navigation]);

  return (
    <IconButton onPress={onPressQR} style={page.container}>
      <Icon name="qr_scanner" color={Color.graphicBase1} />
    </IconButton>
  );
};

const page = StyleSheet.create({
  container: {marginRight: 12},
});
