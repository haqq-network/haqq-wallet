import React, {useCallback, useEffect, useRef, useState} from 'react';
import {PermissionsAndroid, Platform, StyleSheet, View} from 'react-native';
import {BleManager, State} from 'react-native-ble-plx';
import {Button, ButtonVariant, LottieWrap, PopupContainer, Text} from '../ui';
import {TEXT_BASE_2} from '../../variables';
import {User} from '../../models/user';
import {getText, I18N} from '../../i18n';
import {Observable, Subscription} from 'rxjs';
import {ratio, windowWidth} from '../../helpers';

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
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
      }
      const manager = new BleManager();
      let sub = null;
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
    <>
      <View style={page.animation}>
        <LottieWrap
          style={page.imageStyle}
          source={require('../../../assets/animations/bluetooth.json')}
          autoPlay
          loop
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
          disabled={disabled.includes(btState)}
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
  imageStyle: {
    width: windowWidth,
    height: 362 * ratio,
    alignSelf: 'center',
  },
});
