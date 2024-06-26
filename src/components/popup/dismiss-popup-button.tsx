import React from 'react';

import {StyleSheet} from 'react-native';

import {Color} from '@app/colors';
import {useTypedNavigation} from '@app/hooks';
import {HeaderButtonProps} from '@app/types';

import {Icon, IconButton} from '../ui';

type DismissPopupButtonProps = HeaderButtonProps & {
  onClose?: () => void;
};

export const DismissPopupButton = ({onClose}: DismissPopupButtonProps) => {
  //TODO: What type should be used here?
  // onPress should be prop
  const navigation = useTypedNavigation();
  return (
    <IconButton
      style={page.container}
      testID="dismissPopupButton"
      onPress={() => {
        try {
          if (onClose) {
            onClose();
          } else {
            navigation.pop();
          }
        } catch (e) {
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
