import React from 'react';

import {StyleSheet, Switch, View} from 'react-native';

import {DataContent, MenuNavigationButton, Spacer} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {BiometryType} from '@app/types';

const biometryName = {
  [BiometryType.faceId]: 'Face ID',
  [BiometryType.touchId]: 'Touch ID',
  [BiometryType.fingerprint]: 'Fingerprint',
  [BiometryType.unknown]: 'unknown',
};

interface SettingsSecurityProps {
  biometry: boolean;
  biometryType: BiometryType | null;
  onSubmit: () => void;
  onToggleBiometry: () => void;
}

export const SettingsSecurity = ({
  onSubmit,
  biometryType,
  biometry,
  onToggleBiometry,
}: SettingsSecurityProps) => {
  return (
    <View style={page.container}>
      <MenuNavigationButton onPress={onSubmit}>
        <DataContent
          titleI18n={I18N.settingsSecurityChangePin}
          subtitleI18n={I18N.settingsSecurityEnterPin}
        />
      </MenuNavigationButton>
      {biometryType !== null && (
        <MenuNavigationButton hideArrow onPress={() => {}}>
          <DataContent
            title={biometryName[biometryType]}
            subtitleI18n={I18N.settingsSecurityBiometry}
            subtitleI18nParams={{biometry: biometryName[biometryType]}}
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
