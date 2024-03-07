import React, {ReactNode} from 'react';

import {TouchableOpacity, TouchableOpacityProps} from 'react-native';

import {createTheme} from '@app/helpers';
import {Color} from '@app/theme';

type Props = {
  children: ReactNode;
  disablePadding?: boolean;
} & TouchableOpacityProps;

export const ShadowCard = ({
  style,
  disabled = false,
  disablePadding = false,
  children,
  onPress,
  ...props
}: Props) => {
  return (
    <TouchableOpacity
      {...props}
      onPress={onPress}
      disabled={disabled || !onPress}
      style={[
        styles.wrapper,
        style,
        disabled && styles.disabledShadow,
        disablePadding && styles.disablePadding,
      ]}>
      {children}
    </TouchableOpacity>
  );
};

const styles = createTheme({
  wrapper: {
    borderRadius: 13,
    shadowColor: Color.shadowColor3,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    backgroundColor: Color.bg1,
    shadowRadius: 14,
    shadowOpacity: 1,
    elevation: 15,

    paddingVertical: 16,
    marginTop: 24,
    flex: 1,
    flexDirection: 'column',
  },
  disabledShadow: {
    borderColor: Color.graphicSecond1,
    borderWidth: 1,
    shadowRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  disablePadding: {
    paddingVertical: 0,
  },
});
