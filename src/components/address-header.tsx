import React from 'react';

import {StyleSheet} from 'react-native';

import {Text} from './ui';

import {TEXT_BASE_1} from '../variables';

export const AddressHeader = () => {
  return (
    <Text t6 style={page.container}>
      My contacts
    </Text>
  );
};

const page = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 12,
    fontWeight: '600',
    color: TEXT_BASE_1,
  },
});
