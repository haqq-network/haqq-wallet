import React from 'react';

import {StyleSheet, TextInput, TextInputProps} from 'react-native';

import {Color} from '@app/colors';
import {useThematicStyles} from '@app/hooks';
import {I18N} from '@app/i18n';

import {LabelBlockVariant, LabeledBlock} from './labeled-block';

export type InputProps = TextInputProps & {
  label?: string;
  error?: boolean;
  rightAction?: React.ReactNode;
  i18nLabel?: I18N;
};

export const Input = ({
  style,
  label,
  i18nLabel,
  rightAction,
  error,
  ...props
}: InputProps) => {
  const styles = useThematicStyles(stylesObj);
  return (
    <LabeledBlock
      label={label}
      i18nLabel={i18nLabel}
      style={[styles.wrapper, style]}
      variant={error ? LabelBlockVariant.error : LabelBlockVariant.default}
      rightAction={rightAction}>
      <TextInput
        style={[styles.input, props.editable === false && styles.inputDisabled]}
        {...props}
      />
    </LabeledBlock>
  );
};

const stylesObj = StyleSheet.create({
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
