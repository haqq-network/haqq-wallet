import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import {State} from 'react-native-ble-plx';
import {Button, ButtonVariant, PopupContainer, Text} from '../ui';
import {GRAPHIC_GREEN_1, GRAPHIC_SECOND_4, TEXT_BASE_2} from '../../variables';
import {User} from '../../models/user';
import {getText, I18N} from '../../i18n';
import {Observable, Subscription} from 'rxjs';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';

export type LedgerBluetooth = {
  user: User;
  onDone: () => void;
};

const disabled = [State.PoweredOff, State.Unauthorized];

export const LedgerBluetooth = ({user, onDone}: LedgerBluetooth) => {
  const subscription = useRef<null | Subscription>(null);
  const [btState, setBtState] = useState(State.Unknown);

  const tryToInit = useCallback(async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
    }

    let previousAvailable = false;
    subscription.current = new Observable(TransportBLE.observeState).subscribe(
      e => {
        if (e.available !== previousAvailable) {
          previousAvailable = e.available;
          switch (e.type) {
            case State.PoweredOn:
              onDone();
              break;
            default:
              setBtState(e.type);
          }
        }
      },
    );
  }, [onDone]);

  useEffect(() => {
    if (user.bluetooth) {
      tryToInit();
    }
    return () => {
      if (subscription.current) {
        subscription.current?.unsubscribe();
      }
    };
  }, [user.bluetooth, tryToInit]);

  const onPressAllow = useCallback(async () => {
    await tryToInit();
  }, [tryToInit]);

  return (
    <>
      <View style={page.animation}>
        <Image
          source={require('../../../assets/images/ledger-bluetooth.png')}
          style={{
            tintColor: disabled.includes(btState)
              ? GRAPHIC_SECOND_4
              : GRAPHIC_GREEN_1,
          }}
        />
      </View>
      <PopupContainer style={page.container}>
        <Text t4 style={page.title}>
          {getText(
            disabled.includes(btState)
              ? I18N.ledgerBluetoothTitleDisabled
              : I18N.ledgerBluetoothTitleUnknown,
          )}
        </Text>
        <Text t11 style={page.disclaimer}>
          {getText(
            disabled.includes(btState)
              ? I18N.ledgerBluetoothDescriptionDisabled
              : I18N.ledgerBluetoothDescriptionUnknown,
          )}
        </Text>
        <Button
          style={page.submit}
          variant={ButtonVariant.contained}
          title={getText(I18N.ledgerBluetoothAllow)}
          onPress={onPressAllow}
        />
      </PopupContainer>
    </>
  );
};

const page = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
  },
  animation: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 200,
    top: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 4,
    marginHorizontal: 20,
    textAlign: 'center',
  },
  disclaimer: {
    marginBottom: 182,
    textAlign: 'center',
    color: TEXT_BASE_2,
    marginHorizontal: 20,
  },
  submit: {marginBottom: 16, marginHorizontal: 20},
});
