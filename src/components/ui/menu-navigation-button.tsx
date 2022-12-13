import React from 'react';

import {
  StyleProp,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';

import {Color} from '@app/colors';
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
      <View style={[styles.container, style]}>
        <View style={styles.content}>{children}</View>
        {!hideArrow && (
          <Icon i24 name="arrow_forward_small" color={Color.graphicSecond3} />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = createTheme({
  container: {
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
