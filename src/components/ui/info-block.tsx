import React, {useMemo} from 'react';

import {StyleProp, View, ViewStyle} from 'react-native';

import {Text} from './text';

import {Color} from '../../colors';
import {createTheme} from '../../helpers/create-theme';

export enum InfoBlockType {
  warning = 'warning',
}

export type InfoBlockProps = {
  type: InfoBlockType;
  icon?: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  t14?: boolean;
  t15?: boolean;
};

export const InfoBlock = ({
  children,
  icon,
  type,
  style,
  t14 = true,
  t15 = false,
}: InfoBlockProps) => {
  const containerStyle = useMemo(
    () => [page.container, page[`${type}Container`], style],
    [style, type],
  );

  const textStyle = useMemo(
    () => [page.text, page[`${type}Text`], icon ? page.iconText : null],
    [icon, type],
  );
  return (
    <View style={containerStyle}>
      {icon}
      <Text t14={t14} t15={t15} style={textStyle}>
        {children}
      </Text>
    </View>
  );
};

const page = createTheme({
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
  warningText: {
    color: Color.textYellow1,
  },
});
