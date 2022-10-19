import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {Button, ButtonVariant, PopupContainer, Text} from '../components/ui';
import {TEXT_BASE_2} from '../variables';
import {useLedger} from '../contexts/ledger';
import {useUser} from '../contexts/app';
import {State} from 'react-native-ble-plx';

export const LedgerBluetoothScreen = () => {
  const ledger = useLedger();
  const user = useUser();
  const [btState, setBtState] = useState(ledger.state);

  useEffect(() => {
    if (user.bluetooth) {
      const subscription = (value: State) => {
        setBtState(value);
      };
      ledger.on('stateChange', subscription);

      return () => {
        ledger.off('stateChange', subscription);
      };
    }
  }, [ledger, user.bluetooth]);

  useEffect(() => {
    switch (btState) {
      case State.PoweredOn:
        navigation.navigate(route.params.nextScreen ?? 'ledgerScan');
        break;
      default:
        console.log('btState', btState);
    }
  }, [btState]);

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ledgerAgreement'>>();

  const onPressAllow = useCallback(async () => {
    user.bluetooth = true;
    await ledger.init();
    setBtState(ledger.state);
  }, [ledger, user]);

  return (
    <>
      <View style={page.animation} />
      <PopupContainer style={page.container}>
        <Text t4 style={page.title}>
          Allow using Bluetooth
        </Text>
        <Text t11 style={page.disclaimer}>
          App uses bluetooth to find, connect and communicate with Ledger Nano
          devices
        </Text>
        <Text>{btState}</Text>
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
  image: {height: 310},
});
