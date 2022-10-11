import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {MenuNavigationButton, Text} from './ui';
import {TEXT_BASE_1} from '../variables';

export type SettingsButtonProps = {
  next?: string;
  icon: React.ReactNode;
  title: string;
  onPress: (screen?: string) => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const SettingsButton = ({
  icon,
  title,
  onPress,
  next,
  style,
}: SettingsButtonProps) => {
  return (
    <MenuNavigationButton onPress={() => onPress(next)}>
      <View style={[page.container, style]}>
        {icon}
        <Text t11 style={page.text}>
          {title}
        </Text>
      </View>
    </MenuNavigationButton>
  );
};

const page = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  text: {
    marginLeft: 12,
    color: TEXT_BASE_1,
  },
});
