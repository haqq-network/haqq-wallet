import * as React from 'react';
import {useCallback, useMemo} from 'react';

import {StyleSheet, TouchableOpacity, ViewProps} from 'react-native';

export type IconButtonProps = ViewProps & {
  onPress: () => void | Promise<void>;
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
    () => [styles.container, style, disabled && styles.disabled],
    [style, disabled],
  );

  const onPressButton = useCallback(() => {
    if (!disabled) {
      onPress();
    }
  }, [disabled, onPress]);

  return (
    <TouchableOpacity style={containerStyle} {...props} onPress={onPressButton}>
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
