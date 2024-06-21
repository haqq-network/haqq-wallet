import React, {useMemo} from 'react';

import {observer} from 'mobx-react';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';

import {First, Spacer, Text, TextVariant} from '../ui';

export interface EstimatedValueProps {
  title: string | I18N;
  value: string | number | React.ReactNode;
  valueColor?: Color;
}

export const EstimatedValue = observer(
  ({title, value, valueColor = Color.textBase1}: EstimatedValueProps) => {
    const _title = useMemo(() => {
      if (title in I18N) {
        return getText(title as I18N);
      }
      return title;
    }, [title]);

    return (
      <View style={styles.estimatedValueContainer}>
        <Text variant={TextVariant.t14} color={Color.textBase2}>
          {_title}
        </Text>
        <Spacer />
        <First>
          {React.isValidElement(value) && value}
          <Text variant={TextVariant.t14} color={valueColor}>
            {value}
          </Text>
        </First>
      </View>
    );
  },
);

const styles = createTheme({
  estimatedValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
