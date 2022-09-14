import React from 'react';
import {ContactType} from '../models/contact';
import {StyleSheet, Text, TouchableWithoutFeedback, View} from 'react-native';
import {BG_8} from '../variables';
import {DataContent} from './ui';
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
        <DataContent
          style={page.info}
          title={item.name}
          subtitle={shortAddress(item.account)}
        />
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
