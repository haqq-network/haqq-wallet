import React from 'react';

import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {Text, TextPosition, TextVariant} from '@app/components/ui';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';

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
  const text = hasRightText ? getText(rightText) : app.provider.denom + suffix;

  const viewStyles = StyleSheet.flatten([
    center && styles.center,
    right && styles.right,
    style,
  ]);

  return (
    <View style={[styles.container, viewStyles]}>
      <Text
        variant={TextVariant.t13}
        position={TextPosition.center}
        color={color}>
        {sum}
      </Text>
      <Spacer width={2} />
      <Text
        variant={TextVariant.t13}
        position={TextPosition.center}
        style={styles.opacityText}
        color={color}>
        {text}
      </Text>
    </View>
  );
}

const styles = createTheme({
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
