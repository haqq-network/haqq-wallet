import React from 'react';

import {Pressable, View} from 'react-native';

import {Icon, IconButton, IconProps, Text} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {Color, createTheme} from '@app/theme';
import {ColorType} from '@app/types';
import {DEFAULT_HITSLOP} from '@app/variables/common';

export type HeaderButtonProps = {
  onPress?: () => void;
  disabled?: boolean;
  color?: ColorType;
  icon?: IconProps['name'];
  text?: string;
  i18n?: I18N;
  testID?: string;
};

export const HeaderButton = ({
  onPress,
  disabled,
  color,
  icon,
  text,
  i18n,
  testID,
}: HeaderButtonProps) => {
  if (icon) {
    return (
      <IconButton
        testID={testID}
        disabled={disabled}
        onPress={() => onPress?.()}
        hitSlop={DEFAULT_HITSLOP}>
        {icon && <Icon name={icon} color={color ?? Color.textBase1} />}
      </IconButton>
    );
  }

  if (text || i18n) {
    return (
      <Pressable testID={testID} onPress={() => !disabled && onPress?.()}>
        {/* @ts-expect-error */}
        <Text i18n={i18n} t10 color={disabled ? Color.textBase2 : color} center>
          {text || ''}
        </Text>
      </Pressable>
    );
  }

  return <View style={styles.spacer} />;
};

const styles = createTheme({
  spacer: {
    width: 24,
    height: 24,
  },
});
