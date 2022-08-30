import React from 'react';
import {StyleSheet, TextInput, TextInputProps} from 'react-native';
import {TEXT_BASE_1} from '../../variables';
import {LabeledBlock} from './labeled-block';

export type InputProps = TextInputProps & {
  label: string;
};

export const Input = ({style, label, ...props}: InputProps) => {
  return (
    <LabeledBlock label={label} style={style}>
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
