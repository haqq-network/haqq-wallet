import {StyleSheet, Text, TouchableOpacity, ViewProps} from 'react-native';
import * as React from 'react';
import {useCallback, useMemo} from 'react';

export type ButtonProps = Omit<ViewProps, 'children'> & {
  title: string;
  disabled?: boolean;
  variant?: ButtonVariant;
  onPress: () => void;
};

export enum ButtonVariant {
  text = 'text',
  contained = 'contained',
  outlined = 'outlined',
}

export const Button = ({
  title,
  variant = ButtonVariant.text,
  style,
  disabled,
  onPress,
  ...props
}: ButtonProps) => {
  const onPressButton = useCallback(() => {
    if (!disabled) {
      onPress();
    }
  }, [disabled, onPress]);

  const containerStyle = useMemo(
    () => [page.container, page[`${variant}Container`] ?? null, style],
    [style, variant],
  );

  const textStyle = useMemo(
    () => [page.text, page[`${variant}Text`] ?? null],
    [variant],
  );

  return (
    <TouchableOpacity style={containerStyle} onPress={onPressButton} {...props}>
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const page = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 28,
    paddingRight: 28,
  },
  containedContainer: {
    backgroundColor: '#04D484',
    borderRadius: 16,
  },
  textContainer: {},
  outlinedContainer: {
    borderColor: '#04D484',
    borderRadius: 16,
  },
  text: {
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 24,
  },
  containedText: {
    color: '#FFFFFF',
  },
  textText: {},
  outlinedText: {},
});
