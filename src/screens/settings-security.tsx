import React, {useCallback, useRef, useState} from 'react';
import {Container} from '../components/container';
import {CompositeScreenProps} from '@react-navigation/native';
import {Spacer} from '../components/spacer';
import {MenuNavigationButton, Paragraph, ParagraphSize} from '../components/ui';
import {Alert, StyleSheet, Switch, View} from 'react-native';
import {
  GRAPHIC_BASE_4,
  TEXT_BASE_1,
  TEXT_BASE_2,
  TEXT_GREEN_1,
} from '../variables';
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
    <Container>
      <MenuNavigationButton
        onPress={() => navigation.navigate('settingsSecurityPin')}>
        <View>
          <Paragraph style={page.menuTitle}>Change PIN</Paragraph>
          <Paragraph size={ParagraphSize.s} style={page.menuSubtitle}>
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
            <Paragraph size={ParagraphSize.s} style={page.menuSubtitle}>
              Use {biometryName[app.biometryType]} to unlock the app
            </Paragraph>
          </View>
          <Spacer />
          <Switch value={biometry} onChange={onToggleBiometry} />
        </MenuNavigationButton>
      )}
      <Spacer />
    </Container>
  );
};

const page = StyleSheet.create({
  container: {alignItems: 'center'},
  spacer: {justifyContent: 'center', alignItems: 'center'},
  dots: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  dot: {
    width: 18,
    height: 18,
    backgroundColor: GRAPHIC_BASE_4,
    margin: 5,
    borderRadius: 9,
    transform: [{scale: 0.66}],
  },
  active: {
    backgroundColor: TEXT_GREEN_1,
    transform: [{scale: 1}],
  },
  additionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {marginBottom: 60},

  menuSubtitle: {
    color: TEXT_BASE_2,
  },
  menuTitle: {
    color: TEXT_BASE_1,
    marginBottom: 2,
  },
});
