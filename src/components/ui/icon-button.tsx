import * as React from 'react';
import {useCallback, useMemo} from 'react';

import {FOR_DETOX} from '@env';
import {StyleSheet, TouchableOpacity, ViewProps} from 'react-native';

export type IconButtonProps = ViewProps & {
  onPress?: () => void | Promise<void>;
  disabled?: boolean;
};

export const IconButton = ({
  style,
  children,
  disabled,
  onPress,
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

  return (
    <TouchableOpacity
      style={containerStyle}
      activeOpacity={FOR_DETOX ? 1 : 0.2}
      {...props}
      disabled={disabled || !onPress}
      onPress={onPressButton}>
      {children}
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
