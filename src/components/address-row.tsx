import React from 'react';
import {ContactType, shortAddress} from '../models/contact';
import {Text, TouchableWithoutFeedback, View} from 'react-native';
import {BG_8} from '../variables';
import {Paragraph} from './ui';
import {app} from '../contexts/app';

export type AddressRowProps = {
  item: ContactType;
};
export const AddressRow = ({item}: AddressRowProps) => {
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        app.emit('address', item.account);
      }}>
      <View
        style={{
          flexDirection: 'row',
          paddingVertical: 16,
          alignItems: 'center',
        }}>
        <View
          style={{
            width: 42,
            height: 42,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: BG_8,
            borderRadius: 12,
            marginRight: 12,
          }}>
          <Text>{item.name.slice(0, 1)}</Text>
        </View>
        <View style={{justifyContent: 'space-between'}}>
          <Paragraph style={{flex: 1}}>{item.name}</Paragraph>
          <Paragraph style={{flex: 1}}>{shortAddress(item.account)}</Paragraph>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};
