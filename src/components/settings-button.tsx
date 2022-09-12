import React from 'react';
import {StyleSheet, Text, TouchableWithoutFeedback, View} from 'react-native';
import {ArrowForwardIcon, Paragraph} from './ui';
import {Spacer} from './spacer';
import {GRAPHIC_SECOND_3, TEXT_BASE_1} from '../variables';

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
  children,
  onPress,
  next,
}: SettingsButtonProps) => {
  return (
    <TouchableWithoutFeedback onPress={() => onPress(next)}>
      <View style={page.container}>
        {icon}
        <Paragraph style={page.text}>{title}</Paragraph>
        <Spacer />
        {children}
        <ArrowForwardIcon color={GRAPHIC_SECOND_3} />
      </View>
    </TouchableWithoutFeedback>
  );
};

const page = StyleSheet.create({
  container: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  text: {
    marginLeft: 12,
    color: TEXT_BASE_1,
  },
});
