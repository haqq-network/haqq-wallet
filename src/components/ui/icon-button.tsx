import * as React from 'react';
import {useCallback, useMemo} from 'react';

import {TouchableOpacity, ViewProps} from 'react-native';

import {createTheme} from '../../helpers/create-theme';

export type IconButtonProps = ViewProps & {
  onPress: () => void;
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

const page = createTheme({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
