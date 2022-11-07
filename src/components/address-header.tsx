import React from 'react';

import {Text} from './ui';

import {Color} from '../colors';
import {createTheme} from '../helpers/create-theme';

export const AddressHeader = () => {
  return (
    <Text t6 style={page.container}>
      My contacts
    </Text>
  );
};

const page = createTheme({
  container: {
    marginHorizontal: 20,
    marginVertical: 12,
    fontWeight: '600',
    color: Color.textBase1,
  },
});
