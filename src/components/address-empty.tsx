import React from 'react';

import {StyleSheet, View} from 'react-native';

import {Color, getColor} from '@app/colors';

import {NoContactsIcon, Text} from './ui';

export const AddressEmpty = () => {
  return (
    <View style={page.container}>
      <NoContactsIcon
        color={getColor(Color.graphicSecond3)}
        style={page.icon}
      />
      <Text t14 color={Color.textSecond1}>
        No contacts
      </Text>
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 375,
  },
  icon: {marginBottom: 12},
});
