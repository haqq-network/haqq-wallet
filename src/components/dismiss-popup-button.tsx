import React from 'react';

import {useNavigation} from '@react-navigation/native';

import {Icon, IconButton} from './ui';

import {Color} from '../colors';
import {createTheme} from '../helpers/create-theme';

export const DismissPopupButton = () => {
  const navigation = useNavigation();
  return (
    <IconButton style={page.container} onPress={navigation.goBack}>
      <Icon s name="closeCircle" color={getColor(Color.graphicSecond2)} />
    </IconButton>
  );
};

const page = createTheme({
  container: {width: 24, height: 24},
});
