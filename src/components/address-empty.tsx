import React from 'react';

import {View} from 'react-native';

import {NoContactsIcon, Text} from './ui';

import {Color, getColor} from '../colors';
import {createTheme} from '../helpers/create-theme';

export const AddressEmpty = () => {
  return (
    <View style={page.container}>
      <NoContactsIcon
        color={getColor(Color.graphicSecond3)}
        style={page.icon}
      />
      <Text t14 style={page.t14}>
        No contacts
      </Text>
    </View>
  );
};

const page = createTheme({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 375,
  },
  icon: {marginBottom: 12},
  t14: {color: Color.textSecond1},
});
