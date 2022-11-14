import * as React from 'react';

import {StyleSheet, TextProps} from 'react-native';

import {Text} from './text';

import {LIGHT_TEXT_BASE_3, LIGHT_TEXT_RED_1} from '../../variables';

type ErrorTextProps = {
  e0?: boolean;
  e1?: boolean;
  e2?: boolean;
  e3?: boolean;
} & TextProps;

export const ErrorText = ({
  e0,
  e1,
  e2,
  e3,
  style,
  ...props
}: ErrorTextProps) => {
  return (
    <Text
      t6={e0}
      t14={e1 || e2}
      t8={e3}
      style={[
        e0 && StyleSheet.flatten([page.e0Style, style]),
        e1 && StyleSheet.flatten([page.e1Style, style]),
        e2 && StyleSheet.flatten([page.e2Style, style]),
        e3 && StyleSheet.flatten([page.e3Style, style]),
      ]}
      {...props}
    />
  );
};

const page = StyleSheet.create({
  e0Style: {
    fontStyle: 'normal',
    fontSize: 16,
    lineHeight: 22,
    color: LIGHT_TEXT_RED_1,
  },
  e1Style: {
    color: LIGHT_TEXT_RED_1,
  },
  e2Style: {
    fontSize: 16,
    lineHeight: 22,
    color: LIGHT_TEXT_RED_1,
  },
  e3Style: {
    color: LIGHT_TEXT_BASE_3,
  },
});
