import React from 'react';

import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {I18N} from '@app/i18n';
import {RootStackParamList} from '@app/types';

import {DataContent, Icon, IconsName, MenuNavigationButton, Text} from '../ui';

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
  title: I18N;
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
      <View style={styles.container}>
        <Icon i24 name={icon} color={Color.graphicBase1} />
        <DataContent titleI18n={title} style={styles.text} />
        {rightTitle && (
          <Text t11 right style={styles.textRight} color={Color.textBase2}>
            {rightTitle}
          </Text>
        )}
      </View>
    </MenuNavigationButton>
  );
};

const styles = StyleSheet.create({
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
    flex: 1,
    marginRight: 20,
  },
});
