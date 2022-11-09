import React from 'react';
import {StyleSheet} from 'react-native';
import {Icon, IconButton} from './ui';
import {LIGHT_GRAPHIC_SECOND_2} from '../variables';
import {useNavigation} from '@react-navigation/native';

export const DismissPopupButton = () => {
  const navigation = useNavigation();
  return (
    <IconButton style={page.container} onPress={navigation.goBack}>
      <Icon s name="closeCircle" color={LIGHT_GRAPHIC_SECOND_2} />
    </IconButton>
  );
};

const page = StyleSheet.create({
  container: {width: 24, height: 24},
});
