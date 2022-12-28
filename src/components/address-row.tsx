import React from 'react';

import {StyleSheet, TouchableWithoutFeedback, View} from 'react-native';

import {Color} from '@app/colors';
import {useThematicStyles} from '@app/hooks';

import {Box, DataContent, Text} from './ui';

import {Contact} from '../models/contact';
import {shortAddress} from '../utils';

export type AddressRowProps = {
  item: Contact;
  onPress?: (address: string) => void;
};
export const AddressRow = ({item, onPress}: AddressRowProps) => {
  const styles = useThematicStyles(stylesObj);
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        onPress?.(item.account);
      }}>
      <View style={styles.container}>
        <Box style={styles.badge}>
          <Text t13 color={Color.textBase2}>
            {item.name.slice(0, 1)}
          </Text>
        </Box>
        <DataContent
          style={styles.info}
          title={item.name}
          subtitle={shortAddress(item.account)}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const stylesObj = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  badge: {
    marginRight: 12,
    backgroundColor: Color.bg8,
  },
  info: {justifyContent: 'space-between'},
});
