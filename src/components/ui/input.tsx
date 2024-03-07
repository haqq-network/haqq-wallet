import React from 'react';

import {
  StyleProp,
  TextInput,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from 'react-native';

import {I18N} from '@app/i18n';
import {Color, createTheme} from '@app/theme';

import {LabelBlockVariant, LabeledBlock} from './labeled-block';

export type InputProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  error?: boolean;
  rightAction?: React.ReactNode;
  leftAction?: React.ReactNode;
  i18nLabel?: I18N;
  inputStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
};

export const Input = ({
  style,
  label,
  i18nLabel,
  rightAction,
  leftAction,
  inputStyle,
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
        style={[
          page.input,
          props.editable === false && page.inputDisabled,
          inputStyle,
        ]}
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
