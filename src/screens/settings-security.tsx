import React, {useCallback, useRef, useState} from 'react';

import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Alert, StyleSheet, Switch, View} from 'react-native';

import {Pin, PinInterface} from '@app/components/pin';
import {useApp} from '@app/hooks';

import {MenuNavigationButton, Spacer, Text} from '@app/components/ui';
import {BiometryType, RootStackParamList} from '@app/types';
import { I18N } from '@app/i18n';
import { Color } from '@app/colors';

const biometryName = {
  [BiometryType.faceId]: 'Face ID',
  [BiometryType.touchId]: 'Touch ID',
  [BiometryType.fingerprint]: 'Fingerprint',
};

export const SettingsSecurityScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
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
    return <Pin title="Enter ISLM Wallet PIN" onPin={onPin} ref={pinRef} />;
  }

  return (
    <View style={page.container}>
      <MenuNavigationButton
        onPress={() => navigation.navigate('settingsSecurityPin')}>
        <View>
          <Text t11 color={Color.textBase1} style={page.menuTitle} i18n={I18N.SettingsSecurityChangePin}>
            Change PIN
          </Text>
          <Text t14 color={Color.textBase2} i18n={I18N.setttingsSecurityEnterPin}>
            Enter new pin
          </Text>
        </View>
      </MenuNavigationButton>
      {app.biometryType !== null && (
        <MenuNavigationButton hideArrow onPress={() => {}}>
          <View>
            <Text 
              t11
              color={Color.textBase1}
              style={page.menuTitle}
            >
              {biometryName[app.biometryType]}
            </Text>
            <Text
              t14
              color={Color.textBase2}
              i18n={I18N.settingsSecurityBiometry}
              i18params={{biometry: biometryName[app.biometryType]}}
            >
              Use {biometryName[app.biometryType]} to unlock the app
            </Text>
          </View>
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
    marginHorizontal: 20
  },
  menuTitle: {
    marginBottom: 2,
  },
});
