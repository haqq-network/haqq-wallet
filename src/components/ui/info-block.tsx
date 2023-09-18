import React, {useMemo} from 'react';

import {StyleProp, View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

import {Text} from './text';

export enum InfoBlockType {
  warning = 'warning',
}

export type InfoBlockProps = {
  icon?: React.ReactNode;
  bottom?: React.ReactNode;
  children?: React.ReactNode;
  i18n?: I18N;
  i18params?: Record<string, string>;
  style?: StyleProp<ViewStyle>;
  bottomContainerStyle?: StyleProp<ViewStyle>;
  warning?: boolean;
  error?: boolean;
  border?: boolean;
  testID?: string;
};

export const InfoBlock = ({
  warning,
  error,
  children,
  i18n,
  i18params,
  icon,
  style,
  border,
  bottom,
  bottomContainerStyle,
  testID,
}: InfoBlockProps) => {
  const containerStyle = useMemo(
    () => [
      styles.container,
      warning && !border && styles.warningContainer,
      border && styles.border,
      warning && border && styles.warningBorder,
      error && styles.errorContainer,
      error && border && styles.errorBorder,
      style,
    ],
    [border, error, style, warning],
  );

  const textStyle = useMemo(
    () => [styles.text, icon ? styles.iconText : null],
    [icon],
  );

  const textColor = useMemo(
    () =>
      warning ? Color.textYellow1 : error ? Color.textRed1 : Color.textBase1,
    [error, warning],
  );

  return (
    <View testID={testID} style={containerStyle}>
      <View style={styles.contentContainer}>
        {icon}
        {/* @ts-expect-error */}
        <Text
          i18n={i18n}
          i18params={i18params}
          t14
          style={textStyle}
          color={textColor}>
          {children}
        </Text>
      </View>
      {!!bottom && (
        <View style={[styles.bottomContainerStyle, bottomContainerStyle]}>
          {bottom}
        </View>
      )}
    </View>
  );
};

const styles = createTheme({
  bottomContainerStyle: {
    marginTop: 10,
  },
  contentContainer: {
    flexDirection: 'row',
  },
  container: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  warningContainer: {
    backgroundColor: Color.bg6,
  },
  iconText: {marginLeft: 12},
  text: {
    flex: 1,
  },
  border: {
    borderRadius: 12,
    borderColor: Color.graphicSecond2,
    borderWidth: 1,
  },
  warningBorder: {
    borderColor: Color.textYellow1,
  },
  errorContainer: {
    backgroundColor: Color.bg7,
  },
  errorBorder: {
    borderColor: Color.textRed1,
  },
});
