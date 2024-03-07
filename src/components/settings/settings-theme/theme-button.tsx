import React from 'react';

import {AppTheme} from '@theme';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {DataContent, Icon, IconButton} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

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
      <View style={styles.row}>
        <DataContent titleI18n={name} />
        {active && (
          <DataContent
            titleI18n={I18N.isUsed}
            titleColor={Color.graphicGreen1}
          />
        )}
      </View>
      {active && <Icon name="check" i24 color={Color.graphicGreen1} />}
    </IconButton>
  );
};

const styles = createTheme({
  row: {flexDirection: 'row'},
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
