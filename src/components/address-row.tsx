import React from 'react';

import {TouchableWithoutFeedback, View} from 'react-native';

import {Box, DataContent, Text} from './ui';

import {Color} from '../colors';
import {createTheme} from '../helpers/create-theme';
import {Contact} from '../models/contact';
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
          <Text t13 style={page.preview}>
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
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  preview: {
    color: Color.textBase2,
  },
  badge: {
    marginRight: 12,
  },
  info: {justifyContent: 'space-between'},
});
