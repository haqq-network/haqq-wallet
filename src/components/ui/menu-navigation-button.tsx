import React from 'react';
import {StyleSheet, TouchableWithoutFeedback, View} from 'react-native';
import {GRAPHIC_SECOND_3} from '../../variables';
import {ArrowForwardIcon} from './svg-icon';
import {Spacer} from '../spacer';

export type MenuNavigationButtonProps = {
  onPress: () => void;
  children: React.ReactNode;
  hideArrow?: boolean;
};

export const MenuNavigationButton = ({
  onPress,
  children,
  hideArrow = false,
}: MenuNavigationButtonProps) => {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={page.container}>
        {children}
        {!hideArrow && <Spacer />}
        {!hideArrow && <ArrowForwardIcon color={GRAPHIC_SECOND_3} />}
      </View>
    </TouchableWithoutFeedback>
  );
};
const page = StyleSheet.create({
  container: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});
