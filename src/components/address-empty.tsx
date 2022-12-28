import React from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {useTheme} from '@app/hooks';

import {NoContactsIcon, Text} from './ui';

export const AddressEmpty = () => {
  const {colors} = useTheme();
  return (
    <View style={page.container}>
      <NoContactsIcon color={colors.graphicSecond3} style={page.icon} />
      <Text t14 color={Color.textSecond1}>
        No contacts
      </Text>
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 375,
  },
  icon: {marginBottom: 12},
});
