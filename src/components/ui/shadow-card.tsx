import React, {ReactNode} from 'react';

import {TouchableOpacity, TouchableOpacityProps} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {SHADOW_COLOR_3} from '@app/variables/common';

type Props = {
  children: ReactNode;
} & TouchableOpacityProps;

export const ShadowCard = ({
  style,
  disabled = false,
  children,
  onPress,
  ...props
}: Props) => {
  return (
    <TouchableOpacity
      {...props}
      onPress={onPress}
      disabled={disabled || !onPress}
      style={[styles.wrapper, style, disabled && styles.disabledShadow]}>
      {children}
    </TouchableOpacity>
  );
};

const styles = createTheme({
  wrapper: {
    borderRadius: 13,
    shadowColor: SHADOW_COLOR_3,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    backgroundColor: Color.bg1,
    shadowRadius: 24,
    shadowOpacity: 0.15,
    elevation: 13,

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
});
