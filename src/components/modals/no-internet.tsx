import React from 'react';

import {StyleSheet, View} from 'react-native';

import {windowWidth} from '../../helpers';
import {
  LIGHT_BG_1,
  LIGHT_BG_9,
  LIGHT_GRAPHIC_SECOND_4,
  LIGHT_TEXT_BASE_1,
} from '../../variables';
import {NoInternetIcon, Text} from '../ui';

export const NoInternet = () => {
  return (
    <View style={page.container}>
      <View style={page.modalView}>
        <View style={page.modalContent}>
          <Text t5 style={page.titleText}>
            No Internet
          </Text>
          <Text t14 style={page.descriptionText}>
            Make sure you are connected to Wi-Fi or a cellular network
          </Text>
          <NoInternetIcon color={LIGHT_GRAPHIC_SECOND_4} style={page.icon} />
        </View>
      </View>
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: LIGHT_BG_9,
    paddingBottom: 30,
  },
  titleText: {
    textAlign: 'center',
  },
  descriptionText: {
    textAlign: 'center',
    paddingTop: 6,
    width: 290,
    color: LIGHT_TEXT_BASE_1,
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
    backgroundColor: LIGHT_BG_1,
    borderRadius: 16,
    alignItems: 'center',
  },
});
