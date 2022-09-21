import React from 'react';
import {StyleSheet} from 'react-native';
import {TEXT_BASE_1} from '../variables';
import {Paragraph, ParagraphSize} from './ui';

export const AddressHeader = () => {
  return (
    <Paragraph size={ParagraphSize.xl} style={page.container}>
      My contacts
    </Paragraph>
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
