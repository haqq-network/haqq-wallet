import React from 'react';

import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';

import {Color, getColor} from '@app/colors';
import {RootStackParamList} from '@app/types';

import {Icon, IconsName, MenuNavigationButton, Text} from '../ui';

export type SettingsButtonProps = {
  next:
    | 'settingsAccounts'
    | 'settingsAddressBook'
    | 'settingsSecurity'
    | 'settingsProviders'
    | 'settingsAbout'
    | 'settingsTheme'
    | 'settingsTest';
  icon: IconsName | keyof typeof IconsName;
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
        <Icon s name={icon} color={getColor(Color.graphicBase1)} />
        <Text t11 style={page.text} color={getColor(Color.textBase1)}>
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
  },
});
