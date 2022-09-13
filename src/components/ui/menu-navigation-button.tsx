import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import {GRAPHIC_SECOND_3} from '../../variables';
import {ArrowForwardIcon} from './svg-icon';
import {Spacer} from '../spacer';

export type MenuNavigationButtonProps = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  hideArrow?: boolean;
};

export const MenuNavigationButton = ({
  onPress,
  children,
  style,
  hideArrow = false,
}: MenuNavigationButtonProps) => {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={[page.container, style]}>
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
