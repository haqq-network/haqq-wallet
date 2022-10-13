import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {MenuNavigationButton, Text} from './ui';
import {TEXT_BASE_1} from '../variables';

export type SettingsButtonProps = {
  next:
    | 'settingsAccounts'
    | 'settingsAddressBook'
    | 'settingsSecurity'
    | 'settingsAbout';
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
    <MenuNavigationButton onPress={onClickButton}>
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
