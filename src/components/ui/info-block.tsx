import React, {useMemo} from 'react';
import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {BG_6, TEXT_YELLOW_1} from '../../variables';

export enum InfoBlockType {
  warning = 'warning',
}

export type InfoBlockProps = {
  type: InfoBlockType;
  icon?: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const InfoBlock = ({children, icon, type, style}: InfoBlockProps) => {
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
      <Text style={textStyle}>{children}</Text>
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  warningContainer: {
    backgroundColor: BG_6,
  },
  iconText: {marginLeft: 12},
  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
  },
  warningText: {
    color: TEXT_YELLOW_1,
  },
});
