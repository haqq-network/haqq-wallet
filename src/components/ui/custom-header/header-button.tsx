import React from 'react';

import {Pressable, View} from 'react-native';

import {Color} from '@app/colors';
import {Icon, IconButton, IconProps, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {ColorType} from '@app/types';
import {DEFAULT_HITSLOP} from '@app/variables/common';

export type HeaderButtonProps = {
  onPress?: () => void;
  disabled?: boolean;
  color?: ColorType;
  icon?: IconProps['name'];
  text?: string;
  i18n?: I18N;
};

export const HeaderButton = ({
  onPress,
  disabled,
  color,
  icon,
  text,
  i18n,
}: HeaderButtonProps) => {
  if (icon) {
    return (
      <IconButton
        disabled={disabled}
        onPress={() => onPress?.()}
        hitSlop={DEFAULT_HITSLOP}>
        {icon && <Icon name={icon} color={color ?? Color.textBase1} />}
      </IconButton>
    );
  }

  if (text || i18n) {
    return (
      <Pressable onPress={() => !disabled && onPress?.()}>
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
