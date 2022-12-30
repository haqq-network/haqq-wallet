import React from 'react';

import {
  StyleProp,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';

import {Color} from '@app/colors';
import {Icon} from '@app/components/ui';

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

const styles = StyleSheet.create({
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
