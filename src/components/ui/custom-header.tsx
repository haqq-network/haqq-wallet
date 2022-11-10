import React from 'react';

import {Pressable, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {IconButton, Text} from '.';
import {
  DEFAULT_HITSLOP,
  LIGHT_TEXT_BASE_1,
  LIGHT_TEXT_BASE_2,
} from '../../variables';

interface CustomHeaderProps {
  onPressLeft?: () => void;
  onPressRight?: () => void;
  disabledLeft?: boolean;
  disabledRight?: boolean;
  textColorLeft?: string;
  textColorRight?: string;
  renderIconLeft?: () => JSX.Element;
  renderIconRight?: () => JSX.Element;
  textLeft?: string;
  textRight?: string;
  title?: string;
}

export const CustomHeader = ({
  onPressLeft,
  onPressRight,
  disabledLeft,
  disabledRight,
  textColorLeft,
  textColorRight,
  renderIconLeft,
  renderIconRight,
  textLeft,
  textRight,
  title,
}: CustomHeaderProps) => {
  const {top} = useSafeAreaInsets();

  return (
    <View style={[page.container, {marginTop: top}]}>
      <RenderButton
        onPress={onPressLeft}
        disabled={disabledLeft}
        textColor={textColorLeft}
        text={textLeft}
        renderIcon={renderIconLeft}
      />
      <Text t8 style={page.title}>
        {title || ''}
      </Text>
      <RenderButton
        onPress={onPressRight}
        disabled={disabledRight}
        textColor={textColorRight}
        text={textRight}
        renderIcon={renderIconRight}
      />
    </View>
  );
};

interface RenderButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  textColor?: string;
  renderIcon?: () => JSX.Element;
  text?: string;
}

const RenderButton = ({
  onPress,
  disabled,
  textColor,
  renderIcon,
  text,
}: RenderButtonProps) => {
  if (renderIcon) {
    return (
      <IconButton
        disabled={disabled}
        onPress={() => onPress?.()}
        hitSlop={DEFAULT_HITSLOP}>
        {renderIcon()}
      </IconButton>
    );
  } else if (text) {
    return (
      <Pressable onPress={() => !disabled && onPress?.()}>
        <Text
          t10
          color={disabled ? LIGHT_TEXT_BASE_2 : textColor}
          style={page.title}>
          {text || ''}
        </Text>
      </Pressable>
    );
  } else {
    return <View style={page.spacer} />;
  }
};

const page = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 22,
    height: 56,
    flexDirection: 'row',
    zIndex: 1,
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
    color: LIGHT_TEXT_BASE_1,
  },
  spacer: {
    width: 24,
    height: 24,
  },
});
