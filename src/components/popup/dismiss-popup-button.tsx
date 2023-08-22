import React from 'react';

import {useNavigation} from '@react-navigation/native';
import {StyleSheet} from 'react-native';

import {Color} from '@app/colors';

import {Icon, IconButton} from '../ui';

export const DismissPopupButton = () => {
  //TODO: What type should be used heer?
  // onPress should be prop
  const navigation = useNavigation<any>();
  return (
    <IconButton style={page.container} onPress={navigation.goBack}>
      <Icon i24 name="close_circle" color={Color.graphicSecond2} />
    </IconButton>
  );
};

const page = StyleSheet.create({
  container: {width: 24, height: 24},
});
