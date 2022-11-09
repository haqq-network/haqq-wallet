import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {LIGHT_TEXT_BASE_1} from '../variables';
import {MenuNavigationButton, Text} from './ui';

export type SettingsButtonProps = {
  next:
    | 'settingsAccounts'
    | 'settingsAddressBook'
    | 'settingsSecurity'
    | 'settingsProviders'
    | 'settingsAbout'
    | 'settingsTest';
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const SettingsButton = ({
  icon,
  title,
  next,
  style,
}: SettingsButtonProps) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const onClickButton = () => navigation.navigate(next);

  return (
    <MenuNavigationButton onPress={onClickButton} style={style}>
      <View style={page.container}>
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
    color: LIGHT_TEXT_BASE_1,
  },
});
