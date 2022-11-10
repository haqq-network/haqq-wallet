import React from 'react';

import {StyleSheet, TextInput, TextInputProps} from 'react-native';

import {LabelBlockVariant, LabeledBlock} from './labeled-block';

import {LIGHT_TEXT_BASE_1, LIGHT_TEXT_BASE_2} from '../../variables';

export type InputProps = TextInputProps & {
  label: string;
  error?: boolean;
  rightAction?: React.ReactNode;
};

export const Input = ({
  style,
  label,
  rightAction,
  error,
  ...props
}: InputProps) => {
  return (
    <LabeledBlock
      label={label}
      style={[page.wrapper, style]}
      variant={error ? LabelBlockVariant.error : LabelBlockVariant.default}
      rightAction={rightAction}>
      <TextInput
        style={[page.input, props.editable === false && page.inputDisabled]}
        {...props}
      />
    </LabeledBlock>
  );
};

const page = StyleSheet.create({
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: LIGHT_TEXT_BASE_1,
    paddingTop: 0,
    paddingBottom: 0,
  },
  inputDisabled: {
    color: LIGHT_TEXT_BASE_2,
  },
  wrapper: {
    minHeight: 58,
    alignItems: 'center',
  },
});
