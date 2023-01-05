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
  children?: React.ReactNode;
  i18n?: I18N;
  i18params?: Record<string, string>;
  style?: StyleProp<ViewStyle>;
  warning?: boolean;
};

export const InfoBlock = ({
  warning,
  children,
  i18n,
  i18params,
  icon,
  style,
}: InfoBlockProps) => {
  const containerStyle = useMemo(
    () => [styles.container, warning && styles.warningContainer, style],
    [style, warning],
  );

  const textStyle = useMemo(
    () => [styles.text, icon ? styles.iconText : null],
    [icon],
  );

  const textColor = useMemo(
    () => (warning ? Color.textYellow1 : Color.textBase1),
    [warning],
  );

  return (
    <View style={containerStyle}>
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
  );
};

const styles = createTheme({
  container: {
    flexDirection: 'row',
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
});
