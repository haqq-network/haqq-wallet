import React from 'react';

import {StyleProp, View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';

import {DataContent, Icon, IconsName, MenuNavigationButton, Text} from '../ui';

export type SettingsButtonProps = {
  next:
    | 'settingsAccounts'
    | 'settingsAddressBook'
    | 'settingsSecurity'
    | 'settingsProviders'
    | 'settingsAbout'
    | 'settingsTheme'
    | 'settingsTest'
    | 'walletConnectWalletList'
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
  const navigation = useTypedNavigation();

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

const styles = createTheme({
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
