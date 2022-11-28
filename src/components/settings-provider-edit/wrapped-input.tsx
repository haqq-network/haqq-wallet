import React, {useCallback} from 'react';

import {Color} from '@app/colors';
import {Icon, IconButton, Input} from '@app/components/ui';
import {I18N, getText} from '@app/i18n';

export type WrappedInputProps = {
  isEditable: boolean;
  value: string | undefined;
  onChange: (key: string, value: string) => void;
  label: I18N;
  placeholder?: I18N;
  name: string;
};
export const WrappedInput = ({
  name,
  value,
  label,
  onChange,
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

  return (
    <Input
      onChangeText={onChangeText}
      label={getText(label)}
      editable={isEditable}
      placeholder={placeholder ? getText(placeholder) : ''}
      value={value}
      rightAction={
        value &&
        isEditable && (
          <IconButton onPress={onClean}>
            <Icon name="close_circle" color={Color.graphicBase2} />
          </IconButton>
        )
      }
    />
  );
};
