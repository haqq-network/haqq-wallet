import React, {useMemo} from 'react';

import {StyleProp, View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';

import {Icon, IconProps} from './ui';

export interface ISLMLogoProps {
  border?: boolean;
  inverted?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const ISLMLogo = ({style, border, inverted}: ISLMLogoProps) => {
  const iconProps: IconProps = useMemo(
    () => ({
      name: 'islm',
      style: {
        width: inverted ? 42 : 54,
        height: inverted ? 42 : 54,
      },
      color: inverted ? Color.graphicBase3 : Color.graphicGreen1,
    }),
    [inverted],
  );

  return (
    <View
      style={[
        styles.center,
        styles.container,
        styles.radius100,
        border && styles.border,
        style,
      ]}>
      <View
        style={[
          styles.center,
          styles.container,
          styles.radius100,
          inverted && styles.inverted,
        ]}>
        <Icon {...iconProps} />
      </View>
    </View>
  );
};

const styles = createTheme({
  container: {
    width: 44,
    height: 44,
  },
  border: {
    width: 44 + 15,
    height: 44 + 15,
    borderWidth: 1,
    borderColor: Color.graphicBase2,
    borderStyle: 'dashed',
    padding: 10,
  },
  inverted: {
    backgroundColor: Color.graphicGreen1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  radius100: {
    borderRadius: 100,
  },
});
