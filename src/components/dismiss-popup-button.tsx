import React from 'react';

import {useNavigation} from '@react-navigation/native';
import {StyleSheet} from 'react-native';

import {Icon, IconButton} from './ui';

import {GRAPHIC_SECOND_2} from '../variables';

export const DismissPopupButton = () => {
  const navigation = useNavigation();
  return (
    <IconButton style={page.container} onPress={navigation.goBack}>
      <Icon s name="closeCircle" color={GRAPHIC_SECOND_2} />
    </IconButton>
  );
};

const page = StyleSheet.create({
  container: {width: 24, height: 24},
});
