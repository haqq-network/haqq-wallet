import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {BleManager, State} from 'react-native-ble-plx';
import {Button, ButtonVariant, PopupContainer, Text} from '../ui';
import {TEXT_BASE_2} from '../../variables';
import {User} from '../../models/user';

export type LedgerBluetooth = {
  user: User;
  onDone: () => void;
  onAllow: () => void;
};

export const LedgerBluetooth = ({user, onDone}: LedgerBluetooth) => {
  const bleManager = useRef(new BleManager()).current;

  const [btState, setBtState] = useState(State.Unknown);

  useEffect(() => {
    if (user.bluetooth) {
      const subscription = (value: State) => {
        setBtState(value);
      };
      const sub = bleManager.onStateChange(subscription);

      return () => {
        sub.remove();
      };
    }
  }, [bleManager, user.bluetooth]);

  useEffect(() => {
    switch (btState) {
      case State.PoweredOn:
        onDone();
        break;
      default:
        console.log('btState', btState);
    }
  }, [btState, onDone]);

  const onPressAllow = useCallback(async () => {
    const state = await bleManager.state();
    setBtState(state);
  }, [bleManager]);

  return (
    <>
      <View style={page.animation}>
        <Image
          source={require('../../../assets/images/ledger-bluetooth.png')}
        />
      </View>
      <PopupContainer style={page.container}>
        <Text t4 style={page.title}>
          Allow using Bluetooth
        </Text>
        <Text t11 style={page.disclaimer}>
          App uses bluetooth to find, connect and communicate with Ledger Nano
          devices
        </Text>
        <Button
          style={page.submit}
          variant={ButtonVariant.contained}
          title="Allow"
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
