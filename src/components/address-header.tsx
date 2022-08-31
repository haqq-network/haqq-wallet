import React from 'react';
import {StyleSheet, Text} from 'react-native';
import {TEXT_BASE_1} from '../variables';

export const AddressHeader = () => {
  return <Text style={page.container}>My contacts</Text>;
};

const page = StyleSheet.create({
  container: {
    marginVertical: 12,
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 30,
    color: TEXT_BASE_1,
  },
});
