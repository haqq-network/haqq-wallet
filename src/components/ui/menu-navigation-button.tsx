import React from 'react';

import {
  StyleProp,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';

import {Color, getColor} from '@app/colors';
import {Icon} from '@app/components/ui';
import {createTheme} from '@app/helpers';

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
        <View style={page.content}>{children}</View>
        {!hideArrow && (
          <Icon s name="arrow_forward" color={getColor(Color.graphicSecond3)} />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const page = createTheme({
  container: {
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
  },
});
