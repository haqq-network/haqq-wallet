import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  AppState,
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import {BleManager, State} from 'react-native-ble-plx';
import {Button, ButtonVariant, PopupContainer, Text} from '../ui';
import {GRAPHIC_GREEN_1, GRAPHIC_SECOND_4, TEXT_BASE_2} from '../../variables';
import {User} from '../../models/user';
import {getText, I18N} from '../../i18n';

export type LedgerBluetooth = {
  user: User;
  onDone: () => void;
};

const disabled = [State.PoweredOff, State.Unauthorized];

export const LedgerBluetooth = ({user, onDone}: LedgerBluetooth) => {
  const bleManager = useRef<BleManager>(null);

  const [btState, setBtState] = useState(State.Unknown);

  const onChange = useCallback(async () => {
    if (bleManager.current) {
      const state = await bleManager.current.state();

      switch (state) {
        case State.PoweredOn:
          onDone();
          break;
        default:
          setBtState(state);
      }
    }
  }, [onDone, bleManager]);

  const tryToInit = useCallback(
    async (force: boolean) => {
      if (user.bluetooth || force) {
        bleManager.current = new BleManager();

        await onChange();
      }
    },
    [onChange, user.bluetooth],
  );

  useEffect(() => {
    tryToInit();

    const subscriptionBle =
      bleManager.current && bleManager.current.onStateChange(onChange, true);
    const subscriptionApp = AppState.addEventListener('change', onChange);
    return () => {
      subscriptionApp.remove();

      subscriptionBle && subscriptionBle.remove();
    };
  }, [onChange, tryToInit]);

  const onPressAllow = useCallback(async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      );
    }
    await tryToInit(true);
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
