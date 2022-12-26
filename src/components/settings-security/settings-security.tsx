import React, {useCallback, useRef, useState} from 'react';

import {Alert, StyleSheet, Switch, View} from 'react-native';

import {Pin, PinInterface} from '@app/components/pin';
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
  const [loggedIn, setLoggedIn] = useState(false);
  const pinRef = useRef<PinInterface>();

  const onPin = useCallback(
    async (pin: string) => {
      try {
        await app.comparePin(pin);
        setLoggedIn(true);
      } catch (e) {
        pinRef.current?.reset('wrong pin');
      }
    },
    [app],
  );

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

  if (!loggedIn) {
    return (
      <Pin title={I18N.settingsSecurityWalletPin} onPin={onPin} ref={pinRef} />
    );
  }

  return (
    <View style={page.container}>
      <MenuNavigationButton onPress={onSubmit}>
        <DataContent
          titleI18n={I18N.SettingsSecurityChangePin}
          subtitleI18n={I18N.setttingsSecurityEnterPin}
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
