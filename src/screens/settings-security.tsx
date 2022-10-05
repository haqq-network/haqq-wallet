import React, {useCallback, useRef, useState} from 'react';
import {MenuNavigationButton, Paragraph, Spacer} from '../components/ui';
import {CompositeScreenProps} from '@react-navigation/native';
import {Alert, StyleSheet, Switch, View} from 'react-native';
import {TEXT_BASE_1, TEXT_BASE_2} from '../variables';
import {useApp} from '../contexts/app';
import {Pin, PinInterface} from '../components/pin';

type SettingsSecurityScreenProps = CompositeScreenProps<any, any>;

const biometryName = {
  FaceID: 'Face ID',
  TouchID: 'Touch ID',
};

export const SettingsSecurityScreen = ({
  navigation,
}: SettingsSecurityScreenProps) => {
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
        setBiometry(true);
      } catch (e) {
        if (e instanceof Error) {
          Alert.alert(e.message);
        }
        setBiometry(false);
      }
    } else {
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
          <Paragraph style={page.menuTitle}>Change PIN</Paragraph>
          <Paragraph p3 style={page.menuSubtitle}>
            Enter new pin
          </Paragraph>
        </View>
      </MenuNavigationButton>
      {app.biometryType !== null && (
        <MenuNavigationButton hideArrow onPress={() => {}}>
          <View>
            <Paragraph style={page.menuTitle}>
              {biometryName[app.biometryType]}
            </Paragraph>
            <Paragraph p3 style={page.menuSubtitle}>
              Use {biometryName[app.biometryType]} to unlock the app
            </Paragraph>
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
    color: TEXT_BASE_2,
  },
  menuTitle: {
    color: TEXT_BASE_1,
    marginBottom: 2,
  },
});
