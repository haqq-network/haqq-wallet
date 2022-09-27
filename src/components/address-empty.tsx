import React from 'react';
import {View} from 'react-native';
import {NoContactsIcon, Paragraph, ParagraphSize} from './ui';
import {GRAPHIC_SECOND_3, TEXT_SECOND_1} from '../variables';

export const AddressEmpty = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 375,
      }}>
      <NoContactsIcon color={GRAPHIC_SECOND_3} style={{marginBottom: 12}} />
      <Paragraph size={ParagraphSize.s} style={{color: TEXT_SECOND_1}}>
        No contacts
      </Paragraph>
    </View>
  );
};
