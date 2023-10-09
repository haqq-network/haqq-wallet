import React, {memo} from 'react';

import {ScrollView} from 'react-native';

import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {useTesterModeEnabled} from '@app/hooks/use-tester-mode-enabled';
import {useWalletConnectAccounts} from '@app/hooks/use-wallet-connect-accounts';
import {I18N} from '@app/i18n';
import {AppTheme} from '@app/types';
import {capitalize} from '@app/utils';

import {SettingsButton} from './settings-button';

import {IconsName} from '../ui';

type Props = {
  theme: AppTheme;
};

export const HomeSettings = memo(({theme}: Props) => {
  const capitalizedTheme = capitalize(theme);
  const {accounts} = useWalletConnectAccounts();
  const isTesterMode = useTesterModeEnabled();

  return (
    <ScrollView contentContainerStyle={page.container}>
      <SettingsButton
        icon={IconsName.wallet}
        title={I18N.homeSettingsAccounts}
        next="settingsAccounts"
        testID="settings_manage_accounts"
      />

      <SettingsButton
        icon={IconsName.address_book}
        title={I18N.homeSettingsAddressBook}
        next="settingsAddressBook"
      />

      {!!accounts?.length && (
        <SettingsButton
          rightTitle={`${accounts.length}`}
          icon={IconsName.wallet_connect}
          title={I18N.homeSettingsWalletConnect}
          next="walletConnectWalletList"
        />
      )}

      {/* <SettingsButton
        icon={IconsName.language}
        rightTitle="EN"
        title={getText(I18N.homeSettingsLanguage)}
        next="settingsLanguage"
      /> */}

      <SettingsButton
        rightTitle={capitalizedTheme}
        icon={IconsName.brush}
        title={I18N.homeSettingsAppearance}
        next="settingsTheme"
      />

      <SettingsButton
        icon={IconsName.shield}
        title={I18N.homeSettingsSecurity}
        next="settingsSecurity"
      />

      <SettingsButton
        icon={IconsName.bell}
        title={I18N.homeSettingsNotification}
        next="settingsNotification"
      />

      <SettingsButton
        icon={IconsName.providers}
        title={I18N.homeSettingsProviders}
        next="settingsProviders"
        style={page.button}
      />

      {/*<SettingsButton*/}
      {/*  icon={<HelpSettingsIcon color={GRAPHIC_BASE_1} />}*/}
      {/*  title={getText(I18N.homeSettingsFAQ)}*/}
      {/*  onPress={onClickButton}*/}
      {/*  next="settingsFaq"*/}
      {/*/>*/}

      <SettingsButton
        icon={IconsName.islm}
        title={I18N.homeSettingsAbout}
        next="settingsAbout"
        style={page.button}
      />

      {isTesterMode && (
        <SettingsButton
          icon={IconsName.settings}
          title={I18N.homeSettingsDeveloperTools}
          next="settingsDeveloperTools"
        />
      )}

      {app.isDeveloper && (
        <SettingsButton
          icon={IconsName.settings}
          title={I18N.homeSettingsTest}
          next="settingsTest"
          style={page.button}
        />
      )}
    </ScrollView>
  );
});

const page = createTheme({
  container: {
    marginHorizontal: 20,
  },
  button: {
    marginBottom: 20,
  },
});
