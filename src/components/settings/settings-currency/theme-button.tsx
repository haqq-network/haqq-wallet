import React from 'react';

import {DataContent, Icon, IconButton} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {AppTheme, Color, createTheme} from '@app/theme';

export type ThemeButtonProps = {
  value: AppTheme;
  name: I18N;
  active: boolean;
  onChange: (value: AppTheme) => void;
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

const styles = createTheme({
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
