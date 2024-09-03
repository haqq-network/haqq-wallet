import React from 'react';

import {View} from 'react-native';
import {State} from 'react-native-ble-plx';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  First,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme, getWindowHeight, getWindowWidth} from '@app/helpers';
import {I18N} from '@app/i18n';

export type LedgerBluetooth = {
  onPressAllow: () => void;
  onPressGoToPhoneSettings: () => void;
  btState: State;
  loading: boolean;
};

const disabled = [State.PoweredOff, State.Unauthorized];

export const LedgerBluetooth = ({
  onPressAllow,
  onPressGoToPhoneSettings,
  btState,
  loading,
}: LedgerBluetooth) => {
  return (
    <PopupContainer style={page.container}>
      <Spacer />
      <View style={page.animation}>
        <LottieWrap
          style={[
            page.imageStyle,
            disabled.includes(btState) && page.disabledAnimation,
          ]}
          source={require('@assets/animations/ledger-bluetooth.json')}
          autoPlay
          loop
        />
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
      <Spacer height={12} />
      <First>
        {disabled.includes(btState) && (
          <Button
            onPress={onPressGoToPhoneSettings}
            i18n={I18N.goToPhoneSettings}
            style={page.submit}
            variant={ButtonVariant.second}
          />
        )}
        <Button
          loading={loading}
          style={page.submit}
          variant={ButtonVariant.contained}
          i18n={I18N.ledgerBluetoothAllow}
          onPress={onPressAllow}
        />
      </First>
      <Spacer />
    </PopupContainer>
  );
};

const page = createTheme({
  container: {
    justifyContent: 'flex-end',
  },
  animation: {
    width: () => getWindowWidth(),
    height: () => Math.min(getWindowWidth() * 0.8, getWindowHeight() * 0.355),
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 4,
    paddingHorizontal: 20,
  },
  disclaimer: {
    paddingHorizontal: 20,
  },
  submit: {
    marginBottom: 16,
    marginHorizontal: 20,
  },
  imageStyle: {
    width: () => getWindowWidth(),
    height: Math.min(getWindowWidth() * 0.8, getWindowHeight() * 0.355) - 20,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledAnimation: {
    opacity: 0.4,
  },
});
