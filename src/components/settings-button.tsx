import React from 'react';
import {StyleSheet, View} from 'react-native';
import {MenuNavigationButton, Paragraph} from './ui';
import {TEXT_BASE_1} from '../variables';

export type SettingsButtonProps = {
  next?: string;
  icon: React.ReactNode;
  title: string;
  onPress: (screen?: string) => void;
  children?: React.ReactNode;
};

export const SettingsButton = ({
  icon,
  title,
  onPress,
  next,
}: SettingsButtonProps) => {
  return (
    <MenuNavigationButton onPress={() => onPress(next)}>
      <View style={page.container}>
        {icon}
        <Paragraph style={page.text}>{title}</Paragraph>
      </View>
    </MenuNavigationButton>
  );
};

const page = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  text: {
    marginLeft: 12,
    color: TEXT_BASE_1,
  },
});
