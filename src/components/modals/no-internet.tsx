import React from 'react';

import {View} from 'react-native';

import {Color, getColor} from '../../colors';
import {windowWidth} from '../../helpers';
import {createTheme} from '../../helpers/create-theme';
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
          <NoInternetIcon
            color={getColor(Color.graphicSecond4)}
            style={page.icon}
          />
        </View>
      </View>
    </View>
  );
};

const page = createTheme({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: Color.bg9,
    paddingBottom: 30,
  },
  titleText: {
    textAlign: 'center',
  },
  descriptionText: {
    textAlign: 'center',
    paddingTop: 6,
    width: 290,
    color: Color.textBase1,
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
    backgroundColor: Color.bg1,
    borderRadius: 16,
    alignItems: 'center',
  },
});
