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
  type: InfoBlockType;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  i18n?: I18N;
  style?: StyleProp<ViewStyle>;
  t14?: boolean;
  t15?: boolean;
};

export const InfoBlock = ({
  children,
  i18n,
  icon,
  type,
  style,
  t14 = true,
  t15 = false,
}: InfoBlockProps) => {
  const containerStyle = useMemo(
    () => [styles.container, styles[`${type}Container`], style],
    [style, type],
  );

  const textStyle = useMemo(
    () => [styles.text, styles[`${type}Text`], icon ? styles.iconText : null],
    [icon, type],
  );

  const textColor = useMemo(
    () =>
      type === InfoBlockType.warning ? Color.textYellow1 : Color.textBase1,
    [type],
  );

  return (
    <View style={containerStyle}>
      {icon}
      <Text i18n={i18n} t14={t14} t15={t15} style={textStyle} color={textColor}>
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
  // eslint-disable-next-line react-native/no-unused-styles
  warningContainer: {
    backgroundColor: Color.bg6,
  },
  iconText: {marginLeft: 12},
  text: {
    flex: 1,
  },
});
