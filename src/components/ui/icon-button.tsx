import * as React from 'react';
import {useCallback, useMemo} from 'react';

import {
  I18nManager,
  StyleSheet,
  TouchableOpacity,
  ViewProps,
} from 'react-native';
import Config from 'react-native-config';

export type IconButtonProps = ViewProps & {
  onPress?: () => void | Promise<void>;
  disabled?: boolean;
  fixed?: boolean;
};

export const IconButton = ({
  style,
  children,
  disabled,
  onPress,
  fixed = false,
  ...props
}: IconButtonProps) => {
  const containerStyle = useMemo(
    () => [page.container, style, disabled && page.disabled],
    [style, disabled],
  );

  const onPressButton = useCallback(() => {
    if (!disabled && typeof onPress === 'function') {
      onPress();
    }
  }, [disabled, onPress]);

  const content = useMemo(() => {
    const isRTL = I18nManager.isRTL;
    if (isRTL && !fixed) {
      if (Array.isArray(children)) {
        const copy = [...children];
        return copy.reverse();
      }
    }
    return children;
  }, [children, fixed]);

  return (
    <TouchableOpacity
      style={containerStyle}
      activeOpacity={Config.FOR_DETOX ? 1 : 0.2}
      {...props}
      disabled={disabled || !onPress}
      onPress={onPressButton}>
      {content}
    </TouchableOpacity>
  );
};

const page = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
