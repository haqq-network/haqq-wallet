import React from 'react';

import {Image, StyleSheet, View} from 'react-native';
import {State} from 'react-native-ble-plx';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {WINDOW_HEIGHT, WINDOW_WIDTH} from '@app/variables/common';

export type LedgerBluetooth = {
  onPressAllow: () => void;
  btState: State;
  loading: boolean;
};

const disabled = [State.PoweredOff, State.Unauthorized];

export const LedgerBluetooth = ({
  onPressAllow,
  btState,
  loading,
}: LedgerBluetooth) => {
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
        center
        i18n={
          disabled.includes(btState)
            ? I18N.ledgerBluetoothTitleDisabled
            : I18N.ledgerBluetoothTitleUnknown
        }
        style={page.title}
      />
      <Text
        t11
        center
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
        loading={loading}
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
    width: WINDOW_WIDTH,
    height: Math.min(WINDOW_WIDTH * 0.8, WINDOW_HEIGHT * 0.355),
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
    width: WINDOW_WIDTH,
    height: Math.min(WINDOW_WIDTH * 0.8, WINDOW_HEIGHT * 0.355) - 20,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
