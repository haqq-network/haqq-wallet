import React from 'react';

import {TextInput, TextInputProps} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

import {LabelBlockVariant, LabeledBlock} from './labeled-block';

export type InputProps = TextInputProps & {
  label?: string;
  error?: boolean;
  rightAction?: React.ReactNode;
  leftAction?: React.ReactNode;
  i18nLabel?: I18N;
};

export const Input = ({
  style,
  label,
  i18nLabel,
  rightAction,
  leftAction,
  error,
  ...props
}: InputProps) => {
  return (
    <LabeledBlock
      label={label}
      i18nLabel={i18nLabel}
      style={[page.wrapper, style]}
      variant={error ? LabelBlockVariant.error : LabelBlockVariant.default}
      rightAction={rightAction}
      leftAction={leftAction}>
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
