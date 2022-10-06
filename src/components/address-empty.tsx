import React from 'react';
import {StyleSheet, View} from 'react-native';
import {NoContactsIcon, Text} from './ui';
import {GRAPHIC_SECOND_3, TEXT_SECOND_1} from '../variables';

export const AddressEmpty = () => {
  return (
    <View style={page.container}>
      <NoContactsIcon color={GRAPHIC_SECOND_3} style={page.icon} />
      <Text t14 style={{color: TEXT_SECOND_1}}>
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
