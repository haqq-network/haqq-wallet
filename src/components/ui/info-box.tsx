import React from 'react';

import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {useThematicStyles} from '@app/hooks';

import {Text, TextProps} from './text';

export type InfoBoxProps = {
  i18n?: TextProps['i18n'];
  i18params?: TextProps['i18params'];
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const InfoBox = ({children, style, i18n, i18params}: InfoBoxProps) => {
  const styles = useThematicStyles(stylesObj);
  return (
    <View style={StyleSheet.compose(styles.container as ViewStyle, style)}>
      {/* @ts-expect-error */}
      <Text t15 i18n={i18n} i18params={i18params}>
        {children}
      </Text>
    </View>
  );
};

const stylesObj = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Color.graphicSecond1,
  },
});
