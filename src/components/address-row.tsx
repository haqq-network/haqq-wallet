import React from 'react';
import {ContactType} from '../models/contact';
import {StyleSheet, Text, TouchableWithoutFeedback, View} from 'react-native';
import {BG_8, TEXT_BASE_1} from '../variables';
import {Paragraph} from './ui';
import {app} from '../contexts/app';
import {shortAddress} from '../utils';

export type AddressRowProps = {
  item: ContactType;
};
export const AddressRow = ({item}: AddressRowProps) => {
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        app.emit('address', item.account);
      }}>
      <View style={page.container}>
        <View style={page.badge}>
          <Text>{item.name.slice(0, 1)}</Text>
        </View>
        <View style={page.info}>
          <Paragraph style={{flex: 1, color: TEXT_BASE_1}}>
            {item.name}
          </Paragraph>
          <Paragraph style={{flex: 1}}>{shortAddress(item.account)}</Paragraph>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const page = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  badge: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG_8,
    borderRadius: 12,
    marginRight: 12,
  },
  info: {justifyContent: 'space-between'},
});
