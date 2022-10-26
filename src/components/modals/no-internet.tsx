import React from 'react';

import {useNetInfo} from '@react-native-community/netinfo';

import {View, Modal, StyleSheet} from 'react-native';
import {
  BG_1,
  GRAPHIC_SECOND_13,
  GRAPHIC_SECOND_4,
  TEXT_BASE_LIGHT_1,
} from '../../variables';
import {NoInternetIcon, Text} from '../ui';
import {windowWidth} from '../../helpers';

export const NoInternet = () => {
  const {isConnected} = useNetInfo();
  const visible = isConnected !== null && !isConnected;

  return (
    <Modal animationType="fade" transparent visible={!visible}>
      <View style={page.container}>
        <View style={page.modalView}>
          <View style={page.modalContent}>
            <Text t5 style={page.titleText}>
              No Internet
            </Text>
            <Text t14 style={page.descriptionText}>
              Make sure you are connected to Wi-Fi or a cellular network
            </Text>
            <NoInternetIcon color={GRAPHIC_SECOND_4} style={page.icon} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const page = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: GRAPHIC_SECOND_13,
    paddingBottom: 30,
  },
  titleText: {
    textAlign: 'center',
  },
  descriptionText: {
    textAlign: 'center',
    paddingTop: 6,
    width: 290,
    color: TEXT_BASE_LIGHT_1,
  },
  icon: {
    marginTop: 24,
  },
  modalContent: {
    height: 298,
    width: windowWidth - 32,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 0,
  },
  modalView: {
    backgroundColor: BG_1,
    borderRadius: 16,
    alignItems: 'center',
  },
});
