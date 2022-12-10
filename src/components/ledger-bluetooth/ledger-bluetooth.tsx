import React, {useCallback, useEffect, useRef, useState} from 'react';

import {
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import {BleManager, Subscription as BleSub, State} from 'react-native-ble-plx';
import {Observable, Subscription} from 'rxjs';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {windowHeight, windowWidth} from '@app/helpers';
import {I18N} from '@app/i18n';
import {User} from '@app/models/user';

export type LedgerBluetooth = {
  user: User;
  onDone: () => void;
};

const disabled = [State.PoweredOff, State.Unauthorized];

export const LedgerBluetooth = ({user, onDone}: LedgerBluetooth) => {
  const subscription = useRef<null | Subscription>(null);
  const [btState, setBtState] = useState(State.Unknown);

  const tryToInit = useCallback(async () => {
    try {
      if (subscription.current) {
        subscription.current?.unsubscribe();
      }
      if (Platform.OS === 'android') {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        ]);
      }
      const manager = new BleManager();
      let sub: BleSub;
      let previousState = State.Unknown;
      subscription.current = new Observable<State>(observer => {
        manager.state().then(state => {
          observer.next(state);
        });

        sub = manager.onStateChange(state => {
          observer.next(state);
        }, true);
      }).subscribe(e => {
        if (e !== previousState) {
          previousState = e;
          switch (e) {
            case State.PoweredOn:
              onDone();
              sub.remove();
              break;
            default:
              setBtState(e);
          }
        }
      });
    } catch (e) {
      console.log('aaa', e);
    }
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
    <PopupContainer style={page.container}>
      <View style={page.animation}>
        {disabled.includes(btState) ? (
          <Image
            style={page.imageStyle}
            source={require('../../../assets/images/bluetooth-failed.png')}
          />
        ) : (
          <LottieWrap
            style={page.imageStyle}
            source={require('../../../assets/animations/ledger-bluetooth.json')}
            autoPlay
            loop
          />
        )}
      </View>
      <Text
        t4
        center={true}
        i18n={
          disabled.includes(btState)
            ? I18N.ledgerBluetoothTitleDisabled
            : I18N.ledgerBluetoothTitleUnknown
        }
        style={page.title}
      />
      <Text
        t11
        center={true}
        color={Color.textBase2}
        i18n={
          disabled.includes(btState)
            ? I18N.ledgerBluetoothDescriptionDisabled
            : I18N.ledgerBluetoothDescriptionUnknown
        }
        style={page.disclaimer}
      />
      <Spacer />
      <Button
        disabled={disabled.includes(btState)}
        style={page.submit}
        variant={ButtonVariant.contained}
        i18n={I18N.ledgerBluetoothAllow}
        onPress={onPressAllow}
      />
    </PopupContainer>
  );
};

const page = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
  },
  animation: {
    width: windowWidth,
    height: Math.min(windowWidth * 0.8, windowHeight * 0.355),
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 4,
    marginHorizontal: 20,
  },
  disclaimer: {
    marginHorizontal: 20,
  },
  submit: {
    marginBottom: 16,
    marginHorizontal: 20,
  },
  imageStyle: {
    width: windowWidth,
    height: Math.min(windowWidth * 0.8, windowHeight * 0.355) - 20,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
