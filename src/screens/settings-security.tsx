import React, {useCallback, useRef, useState} from 'react';
import {Alert, StyleSheet, Switch, View} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {BiometryType, RootStackParamList} from '../types';
import {MenuNavigationButton, Spacer, Text} from '../components/ui';
import {LIGHT_TEXT_BASE_1, LIGHT_TEXT_BASE_2} from '../variables';
import {useApp} from '../contexts/app';
import {Pin, PinInterface} from '../components/pin';

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
          <Text t11 style={page.menuTitle}>
            Change PIN
          </Text>
          <Text t14 style={page.menuSubtitle}>
            Enter new pin
          </Text>
        </View>
      </MenuNavigationButton>
      {app.biometryType !== null && (
        <MenuNavigationButton hideArrow onPress={() => {}}>
          <View>
            <Text t11 style={page.menuTitle}>
              {biometryName[app.biometryType]}
            </Text>
            <Text t14 style={page.menuSubtitle}>
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
  container: {flex: 1, marginHorizontal: 20},

  menuSubtitle: {
    color: LIGHT_TEXT_BASE_2,
  },
  menuTitle: {
    color: LIGHT_TEXT_BASE_1,
    marginBottom: 2,
  },
});
