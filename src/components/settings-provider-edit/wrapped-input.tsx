import React, {useCallback} from 'react';

import {Color} from '@app/colors';
import {Icon, IconButton, TextField} from '@app/components/ui';
import {I18N} from '@app/i18n';

export type WrappedInputProps = {
  autoFocus?: boolean;
  isEditable: boolean;
  value: string | undefined;
  error?: string;
  onChange: (key: string, value: string) => void;
  onBlur: (key: string) => void;
  label: I18N;
  placeholder: I18N;
  name: string;
};
export const WrappedInput = ({
  name,
  value,
  error,
  label,
  onBlur,
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

  return (
    <TextField
      label={label}
      value={value}
      autoFocus={autoFocus}
      placeholder={placeholder}
      onChangeText={onChangeText}
      multiline
      onBlur={onBlurEvent}
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
    />
  );
};
