import React, {useMemo} from 'react';
import {StyleSheet, TextInput, TextInputProps, View} from 'react-native';
import {BG_8, TEXT_BASE_1, TEXT_BASE_2} from '../../variables';
import {Text} from './text';

type TextareaProps = Omit<TextInputProps, 'multiline'>;

export const Textarea = ({
  value,
  onChangeText,
  placeholder,
  style,
  ...props
}: TextareaProps) => {
  const containerStyle = useMemo(() => [page.container, style], [style]);

  return (
    <View style={containerStyle}>
      <Text t14 style={page.placeholder}>
        {placeholder}
      </Text>
      <TextInput
        onChangeText={onChangeText}
        value={value}
        style={page.input}
        {...props}
        multiline
      />
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    backgroundColor: BG_8,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  placeholder: {
    color: TEXT_BASE_2,
  },
  input: {
    fontSize: 16,
    lineHeight: 22,
    color: TEXT_BASE_1,
    height: 110,
  },
});
