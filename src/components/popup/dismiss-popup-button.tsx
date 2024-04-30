import React from 'react';

import {StyleSheet} from 'react-native';

import {Color} from '@app/colors';
import {useTypedNavigation} from '@app/hooks';

import {Icon, IconButton} from '../ui';

export const DismissPopupButton = () => {
  //TODO: What type should be used here?
  // onPress should be prop
  const navigation = useTypedNavigation();
  return (
    <IconButton
      style={page.container}
      testID="dismissPopupButton"
      onPress={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      }}>
      <Icon i24 name="close_circle" color={Color.graphicSecond2} />
    </IconButton>
  );
};

const page = StyleSheet.create({
  container: {width: 24, height: 24},
});
