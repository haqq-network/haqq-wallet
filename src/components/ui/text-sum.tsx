import React from 'react';

import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';

import {Spacer} from './spacer';

interface TextSumProps {
  sum: string;
  color?: Color;
  center?: boolean;
  right?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function TextSum({
  sum,
  color = Color.textGreen1,
  center,
  right,
  style,
}: TextSumProps) {
  const viewStyles = StyleSheet.flatten([
    center && styles.center,
    right && styles.right,
    style,
  ]);

  return (
    <View style={[styles.container, viewStyles]}>
      <Text t13 center color={color}>
        {sum}
      </Text>
      <Spacer width={2} />
      <Text t13 center style={styles.opacityText} color={color}>
        ISLM
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
