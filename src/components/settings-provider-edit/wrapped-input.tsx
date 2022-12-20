import React, {useCallback} from 'react';

import {NativeSyntheticEvent, TextInputFocusEventData} from 'react-native';

import {Color} from '@app/colors';
import {Icon, IconButton, TextField} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';

export type WrappedInputProps = {
  autoFocus?: boolean;
  isEditable: boolean;
  value: string | undefined;
  error?: string;
  onChange: (key: keyof Provider, value: string) => void;
  onBlur: (key: keyof Provider) => void;
  onFocus: (
    key: keyof Provider,
    event: NativeSyntheticEvent<TextInputFocusEventData>,
  ) => void;
  label: I18N;
  hint: I18N;
  placeholder: I18N;
  name: keyof Provider;
};
export const WrappedInput = ({
  name,
  hint,
  value,
  error,
  label,
  onBlur,
  onFocus,
  onChange,
  autoFocus,
  isEditable,
  placeholder,
}: WrappedInputProps) => {
  const onClean = useCallback(() => {
    onChange(name, '');
  }, [onChange, name]);

  const onChangeText = useCallback(
    (v: string) => {
      onChange(name, v);
    },
    [name, onChange],
  );

  const onBlurEvent = useCallback(() => {
    onBlur(name);
  }, [name, onBlur]);

  const onFocusEvent = useCallback(
    (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      onFocus(name, e);
    },
    [name, onFocus],
  );

  return (
    <TextField
      label={label}
      value={value}
      autoFocus={autoFocus}
      placeholder={placeholder}
      onChangeText={onChangeText}
      multiline
      onBlur={onBlurEvent}
      onFocus={onFocusEvent}
      rightAction={
        value &&
        isEditable && (
          <IconButton onPress={onClean}>
            <Icon name="close_circle" color={Color.graphicBase2} />
          </IconButton>
        )
      }
      editable={isEditable}
      error={Boolean(error)}
      errorText={error}
      hint={hint}
    />
  );
};
