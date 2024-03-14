import React from 'react';

import {StyleSheet} from 'react-native';

import {I18N} from '@app/i18n';
import {Color} from '@app/theme';

import {Text} from './ui';

export const AddressHeader = () => {
  return (
    <Text
      t6
      i18n={I18N.settingsAddressBookTitle}
      style={page.container}
      color={Color.textBase1}
    />
  );
};

const page = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 12,
  },
});
