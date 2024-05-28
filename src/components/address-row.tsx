import React from 'react';

import {TouchableWithoutFeedback, View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {shortAddress} from '@app/helpers/short-address';

import {Box, DataContent, Text} from './ui';

import {Contact} from '../models/contact';

export type AddressRowProps = {
  item: Contact;
  onPress?: (address: string) => void;
};
export const AddressRow = ({item, onPress}: AddressRowProps) => {
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        onPress?.(item.account);
      }}>
      <View style={page.container}>
        <Box style={page.badge}>
          <Text t13 color={Color.textBase2}>
            {item.name.slice(0, 1)}
          </Text>
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

const page = createTheme({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  badge: {
    marginRight: 12,
    backgroundColor: Color.bg8,
  },
  info: {justifyContent: 'space-between'},
});
