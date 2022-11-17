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
  rightTitle?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const SettingsButton = ({
  icon,
  title,
  next,
  style,
  rightTitle,
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
        {rightTitle && (
          <Text t11 style={page.textRight} color={getColor(Color.textBase2)}>
            {rightTitle}
          </Text>
        )}
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
  textRight: {
    textAlign: 'right',
    flex: 1,
    marginRight: 20,
  },
});
