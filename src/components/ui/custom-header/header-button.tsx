import React from 'react';

import {Pressable, StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {Icon, IconButton, IconProps, Text} from '@app/components/ui';
import {ColorType} from '@app/types';
import {DEFAULT_HITSLOP} from '@app/variables';

export type HeaderButtonProps = {
  onPress?: () => void;
  disabled?: boolean;
  color?: ColorType;
  icon?: IconProps['name'];
  text?: string;
};

export const HeaderButton = ({
  onPress,
  disabled,
  color,
  icon,
  text,
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

  if (text) {
    return (
      <Pressable onPress={() => !disabled && onPress?.()}>
        <Text t10 color={disabled ? Color.textBase2 : color} center>
          {text || ''}
        </Text>
      </Pressable>
    );
  }

  return <View style={page.spacer} />;
};

const page = StyleSheet.create({
  spacer: {
    width: 24,
    height: 24,
  },
});
