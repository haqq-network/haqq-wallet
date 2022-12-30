import React from 'react';

import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui';
import {I18N, getText} from '@app/i18n';
import {cleanNumber} from '@app/utils';

import {Spacer} from './spacer';

interface TextSumProps {
  sum: string;
  rightText?: I18N;
  color?: Color;
  center?: boolean;
  right?: boolean;
  suffix?: string;
  style?: StyleProp<ViewStyle>;
}

export function TextSum({
  sum,
  rightText,
  color = Color.textBase1,
  center,
  right,
  suffix = '',
  style,
}: TextSumProps) {
  const hasRightText = typeof rightText !== 'undefined';
  const text = hasRightText ? getText(rightText) : 'ISLM' + suffix;

  const viewStyles = StyleSheet.flatten([
    center && styles.center,
    right && styles.right,
    style,
  ]);

  return (
    <View style={[styles.container, viewStyles]}>
      <Text t13 center color={color}>
        {cleanNumber(sum)}
      </Text>
      <Spacer width={2} />
      <Text t13 center style={styles.opacityText} color={color}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  opacityText: {
    opacity: 0.5,
  },
  center: {
    alignSelf: 'center',
  },
  right: {
    alignSelf: 'flex-end',
  },
});
