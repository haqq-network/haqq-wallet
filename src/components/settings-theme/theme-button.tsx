import React from 'react';

import {StyleSheet} from 'react-native';

import {Color, ThemeNameType} from '@app/colors';
import {DataContent, Icon, IconButton} from '@app/components/ui';
import {I18N} from '@app/i18n';

export type ThemeButtonProps = {
  value: ThemeNameType | 'system';
  name: I18N;
  active: boolean;
  onChange: (value: ThemeNameType | 'system') => void;
};
export const ThemedButton = ({
  onChange,
  active,
  value,
  name,
}: ThemeButtonProps) => {
  return (
    <IconButton
      style={styles.button}
      onPress={() => {
        onChange(value);
      }}>
      <DataContent titleI18n={name} />
      {active && <Icon name="check" i24 color={Color.graphicGreen1} />}
    </IconButton>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
