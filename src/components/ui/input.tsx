import React from 'react';
import {StyleSheet, TextInput, TextInputProps} from 'react-native';
import {TEXT_BASE_1} from '../../variables';
import {LabeledBlock} from './labeled-block';

export type InputProps = TextInputProps & {
  label: string;
  rightAction?: React.ReactNode;
};

export const Input = ({style, label, rightAction, ...props}: InputProps) => {
  return (
    <LabeledBlock label={label} style={style} rightAction={rightAction}>
      <TextInput style={page.input} {...props} />
    </LabeledBlock>
  );
};

const page = StyleSheet.create({
  input: {
    fontSize: 16,
    lineHeight: 22,
    color: TEXT_BASE_1,
  },
});
