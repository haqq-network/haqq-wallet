import React, {useCallback, useEffect, useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {State} from 'react-native-ble-plx';
import {Button, ButtonVariant, PopupContainer, Text} from '../ui';
import {TEXT_BASE_2} from '../../variables';
import {Ledger} from '../../services/ledger';
import {User} from '../../models/user';

export type LedgerBluetooth = {
  ledgerService: Ledger;
  user: User;
  onDone: () => void;
  onAllow: () => void;
};

export const LedgerBluetooth = ({
  ledgerService,
  user,
  onDone,
}: LedgerBluetooth) => {
  const [btState, setBtState] = useState(ledgerService.state);

  useEffect(() => {
    if (user.bluetooth) {
      const subscription = (value: State) => {
        setBtState(value);
      };
      ledgerService.on('stateChange', subscription);

      return () => {
        ledgerService.off('stateChange', subscription);
      };
    }
  }, [ledgerService, user.bluetooth]);

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
    await ledgerService.init();
    setBtState(ledgerService.state);
  }, [ledgerService]);

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
