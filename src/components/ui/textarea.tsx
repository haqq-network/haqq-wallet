import React, {useMemo} from 'react';

import {TextInput, TextInputProps, View} from 'react-native';

import {Text} from './text';

import {Color} from '../../colors';
import {createTheme} from '../../helpers/create-theme';

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

const page = createTheme({
  container: {
    backgroundColor: Color.bg8,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  placeholder: {
    color: Color.textBase2,
  },
  input: {
    fontSize: 16,
    lineHeight: 22,
    color: Color.textBase1,
    height: 110,
  },
});
