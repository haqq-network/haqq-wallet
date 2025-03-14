import React, {useMemo, useState} from 'react';

import {observer} from 'mobx-react';
import {ScrollView} from 'react-native';

import {Color} from '@app/colors';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {
  checkNeedUpdate,
  getRemoteVersion,
} from '@app/helpers/check-app-version';
import {useWalletConnectAccounts} from '@app/hooks/use-wallet-connect-accounts';
import {I18N, getText} from '@app/i18n';
import {AppStore} from '@app/models/app';
import {Currencies} from '@app/models/currencies';
import {Language} from '@app/models/language';
import {VariablesString} from '@app/models/variables-string';
import {HomeStackRoutes, SettingsStackRoutes} from '@app/route-types';
import {AppTheme} from '@app/types';
import {openStorePage} from '@app/utils';

import {SettingsButton} from './settings-button';

import {
  Button,
  ButtonSize,
  ButtonVariant,
  Icon,
  IconsName,
  InfoBlock,
  Spacer,
} from '../ui';

export const HomeSettings = observer(() => {
  const [appVersionHidden, setAppVersionHidden] = useState(false);
  const {accounts} = useWalletConnectAccounts();
  const selectedCurrency = Currencies.selectedCurrency;
  const isUpdateNeeded = appVersionHidden ? false : checkNeedUpdate();
  const onHide = () => {
    setAppVersionHidden(true);
    VariablesString.set('version_to_ignore', getRemoteVersion()!);
  };

  const capitalizedTheme = useMemo(() => {
    switch (app.theme) {
      case AppTheme.light:
        return getText(I18N.settingsThemeLight);
      case AppTheme.dark:
        return getText(I18N.settingsThemeDark);
      case AppTheme.system:
      default:
        return getText(I18N.settingsThemeSystem);
    }
  }, [app.theme, Language.current]);

  return (
    <ScrollView contentContainerStyle={page.container} testID="settings_home">
      {isUpdateNeeded && (
        <InfoBlock
          testID="recovery_warning"
          border
          icon={
            <Icon
              i24
              name={IconsName.refresh_double}
              color={Color.graphicBase1}
            />
          }
          i18n={I18N.settingsOutdatedApp}
          bottomContainerStyle={page.row}
          style={page.inifoBlock}
          bottom={
            <>
              <Button
                style={page.flex}
                size={ButtonSize.small}
                i18n={I18N.newUpdateCancel}
                variant={ButtonVariant.second}
                testID="recovery_phrase"
                onPress={onHide}
              />
              <Spacer width={10} />
              <Button
                style={page.flex}
                size={ButtonSize.small}
                i18n={I18N.newUpdateAccept}
                variant={ButtonVariant.contained}
                //@ts-ignore
                onPress={openStorePage}
              />
            </>
          }
        />
      )}
      <SettingsButton
        icon={IconsName.wallet}
        title={I18N.homeSettingsAccounts}
        next={SettingsStackRoutes.SettingsAccounts}
        testID="settings_manage_accounts"
      />

      <SettingsButton
        icon={IconsName.address_book}
        title={I18N.homeSettingsAddressBook}
        next={SettingsStackRoutes.SettingsAddressBook}
      />

      {!!accounts?.length && (
        <SettingsButton
          rightTitle={`${accounts.length}`}
          icon={IconsName.wallet_connect}
          title={I18N.homeSettingsWalletConnect}
          next={SettingsStackRoutes.WalletConnectWalletList}
        />
      )}

      <SettingsButton
        rightTitle={selectedCurrency}
        next={SettingsStackRoutes.SettingsCurrency}
        icon={IconsName.currency}
        title={I18N.homeSettingsCurrency}
      />

      <SettingsButton
        rightTitle={Language.current.toUpperCase()}
        next={SettingsStackRoutes.SettingsLanguage}
        icon={IconsName.language}
        title={I18N.homeSettingsLanguage}
      />

      <SettingsButton
        rightTitle={capitalizedTheme}
        icon={IconsName.brush}
        title={I18N.homeSettingsAppearance}
        next={SettingsStackRoutes.SettingsTheme}
      />

      <SettingsButton
        icon={IconsName.shield}
        title={I18N.homeSettingsSecurity}
        next={SettingsStackRoutes.SettingsSecurity}
      />

      <SettingsButton
        icon={IconsName.bell}
        title={I18N.homeSettingsNotification}
        next={SettingsStackRoutes.SettingsNotification}
      />

      <SettingsButton
        icon={IconsName.providers}
        title={I18N.homeSettingsProviders}
        next={SettingsStackRoutes.SettingsProviders}
        style={page.button}
      />

      <SettingsButton
        icon={IconsName.islm}
        title={I18N.homeSettingsAbout}
        next={SettingsStackRoutes.SettingsAbout}
        style={page.button}
      />

      {AppStore.isTesterModeEnabled && (
        <SettingsButton
          icon={IconsName.settings}
          title={I18N.homeSettingsDeveloperTools}
          next={SettingsStackRoutes.SettingsDeveloperTools}
        />
      )}

      {AppStore.networkLoggerEnabled && (
        <SettingsButton
          icon={IconsName.browser}
          title={I18N.networkLoggerTitle}
          next={HomeStackRoutes.NetworkLogger}
        />
      )}

      {AppStore.isDeveloperModeEnabled && (
        <SettingsButton
          icon={IconsName.settings}
          title={I18N.homeSettingsTest}
          next={SettingsStackRoutes.SettingsTest}
          style={page.button}
        />
      )}
    </ScrollView>
  );
});

const page = createTheme({
  inifoBlock: {
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
  },
  flex: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
  },
  button: {
    marginBottom: 20,
  },
});
