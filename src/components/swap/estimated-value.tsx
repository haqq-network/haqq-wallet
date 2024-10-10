import React, {useMemo, useRef} from 'react';

import {uuidv4} from '@haqq/rn-wallet-providers/dist/utils';
import {observer} from 'mobx-react';
import {View} from 'react-native';
import AnimatedRollingNumber from 'react-native-animated-rolling-numbers';
import {Easing} from 'react-native-reanimated';

import {Color, getColor} from '@app/colors';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {
  LONG_NUM_PRECISION,
  NUM_PRECISION,
  STRINGS,
} from '@app/variables/common';

import {First, Spacer, Text, TextVariant} from '../ui';

export interface EstimatedValueProps {
  title: string | I18N;
  value: string | number | React.ReactNode;
  valueColor?: Color;
}

export const EstimatedValue = observer(
  ({title, value, valueColor = Color.textBase1}: EstimatedValueProps) => {
    const uuid = useRef(uuidv4()).current;
    const _value = useMemo(() => {
      if (typeof value === 'string') {
        return value.split(STRINGS.NBSP).map(v => {
          try {
            const n = parseFloat(v);
            if (Number.isNaN(n)) {
              return v;
            }
            return n;
          } catch (e) {
            return v;
          }
        });
      }
      return [];
    }, [value]);
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
          {typeof value === 'string' && (
            <View style={styles.rowContainer}>
              {_value.map((v, i) => {
                if (typeof v === 'number') {
                  return (
                    <AnimatedRollingNumber
                      key={`estimated-animated-value-${uuid}-idx-${i}`}
                      value={v}
                      useGrouping
                      toFixed={
                        v === 0
                          ? undefined
                          : v >= 1
                          ? // for numbers greater than or equal to 1, we need to show 2 digits after the decimal point
                            NUM_PRECISION
                          : // for numbers less than 1, we need to show more digits
                            LONG_NUM_PRECISION
                      }
                      textStyle={{color: getColor(valueColor)}}
                      spinningAnimationConfig={{
                        duration: 500,
                        easing: Easing.bounce,
                      }}
                    />
                  );
                }
                return (
                  <Text
                    key={`estimated-text-value-${uuid}-idx-${i}`}
                    variant={TextVariant.t14}
                    color={valueColor}>
                    {STRINGS.NBSP}
                    {v}
                    {STRINGS.NBSP}
                  </Text>
                );
              })}
            </View>
          )}
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
    marginBottom: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
});
