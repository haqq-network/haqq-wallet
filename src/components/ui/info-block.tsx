import React, {useMemo} from 'react';

import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {useThematicStyles} from '@app/hooks';
import {I18N} from '@app/i18n';

import {Text} from './text';

export enum InfoBlockType {
  warning = 'warning',
}

export type InfoBlockProps = {
  icon?: React.ReactNode;
  i18n: I18N;
  i18params?: Record<string, string>;
  style?: StyleProp<ViewStyle>;
  warning?: boolean;
};

export const InfoBlock = ({
  warning,
  i18n,
  i18params,
  icon,
  style,
}: InfoBlockProps) => {
  const styles = useThematicStyles(stylesObj);

  const containerStyle = useMemo(
    () => [styles.container, warning && styles.warningContainer, style],
    [style, warning, styles],
  );

  const textStyle = useMemo(
    () => [styles.text, icon ? styles.iconText : null],
    [icon, styles],
  );

  const textColor = useMemo(
    () => (warning ? Color.textYellow1 : Color.textBase1),
    [warning],
  );

  return (
    <View style={containerStyle}>
      {icon}
      <Text
        i18n={i18n}
        i18params={i18params}
        t14
        style={textStyle}
        color={textColor}
      />
    </View>
  );
};

const stylesObj = StyleSheet.create({
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
