import React from 'react';

import {TextInput, TextInputProps} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';

import {LabelBlockVariant, LabeledBlock} from './labeled-block';

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

const page = createTheme({
  input: {
    flex: 1,
    fontSize: 16,
    color: Color.textBase1,
    minHeight: 22,
  },
  inputDisabled: {
    color: Color.textBase2,
  },
  wrapper: {
    minHeight: 58,
    alignItems: 'center',
  },
});
