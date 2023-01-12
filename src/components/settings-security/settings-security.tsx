import React, {useCallback, useState} from 'react';

import {Alert, StyleSheet, Switch, View} from 'react-native';

import {DataContent, MenuNavigationButton, Spacer} from '@app/components/ui';
import {useApp} from '@app/hooks';
import {I18N} from '@app/i18n';
import {BiometryType} from '@app/types';

const biometryName = {
  [BiometryType.faceId]: 'Face ID',
  [BiometryType.touchId]: 'Touch ID',
  [BiometryType.fingerprint]: 'Fingerprint',
  [BiometryType.unknown]: 'unknown',
};

interface SettingsSecurityProps {
  onSubmit?: () => void;
}

export const SettingsSecurity = ({
  onSubmit = () => {},
}: SettingsSecurityProps) => {
  const app = useApp();
  const [biometry, setBiometry] = useState(app.biometry);

  const onToggleBiometry = useCallback(async () => {
    if (!biometry) {
      try {
        await app.biometryAuth();
        app.biometry = true;
        setBiometry(true);
      } catch (e) {
        if (e instanceof Error) {
          Alert.alert(e.message);
        }
        app.biometry = false;
        setBiometry(false);
      }
    } else {
      app.biometry = false;
      setBiometry(false);
    }
  }, [app, biometry]);

  return (
    <View style={page.container}>
      <MenuNavigationButton onPress={onSubmit}>
        <DataContent
          titleI18n={I18N.settingsSecurityChangePin}
          subtitleI18n={I18N.settingsSecurityEnterPin}
        />
      </MenuNavigationButton>
      {app.biometryType !== null && (
        <MenuNavigationButton hideArrow onPress={() => {}}>
          <DataContent
            title={biometryName[app.biometryType]}
            subtitleI18n={I18N.settingsSecurityBiometry}
            subtitleI18nParams={{biometry: biometryName[app.biometryType]}}
          />
          <Spacer />
          <Switch value={biometry} onChange={onToggleBiometry} />
        </MenuNavigationButton>
      )}
      <Spacer />
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
  },
});
