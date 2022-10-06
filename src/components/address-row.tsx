import React from 'react';
import {Contact} from '../models/contact';
import {StyleSheet, TouchableWithoutFeedback, View} from 'react-native';
import {Box, DataContent, Text} from './ui';
import {shortAddress} from '../utils';

export type AddressRowProps = {
  item: Contact;
  onPress: (address: string) => void;
};
export const AddressRow = ({item, onPress}: AddressRowProps) => {
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        onPress(item.account);
      }}>
      <View style={page.container}>
        <Box style={page.badge}>
          <Text clean>{item.name.slice(0, 1)}</Text>
        </Box>
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
    marginRight: 12,
  },
  info: {justifyContent: 'space-between'},
});
