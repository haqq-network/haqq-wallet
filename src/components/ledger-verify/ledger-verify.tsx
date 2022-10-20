import React, {useEffect} from 'react';
import {LottieWrap, PopupContainer, Text} from '../ui';
import {Ledger} from '../../services/ledger';
import {Dimensions, StyleSheet, View} from 'react-native';

export type LedgerInfo = {
  address: string;
  deviceId: string;
  deviceName: string;
};

export type LedgerVerifyProps = {
  address: string;
  ledgerService: Ledger;
  onDone: (info: LedgerInfo) => void;
};

export const LedgerVerify = ({
  ledgerService,
  onDone,
  address,
}: LedgerVerifyProps) => {
  useEffect(() => {
    ledgerService
      .getAddressTransport(ledgerService.device!, true)
      .then((verifiedAddress: string | null) => {
        if (!verifiedAddress || !ledgerService.device) {
          throw new Error('something wrong');
        }

        onDone({
          address: verifiedAddress,
          deviceId: ledgerService.device.id,
          deviceName: `Ledger ${ledgerService.device.name}`,
        });
      });
  }, [ledgerService, onDone]);

  return (
    <PopupContainer style={styles.container}>
      <Text t9>
        Verify address {address} on your Ledger Nano X by pressing both buttons
        together
      </Text>
      <LottieWrap
        style={styles.lottie}
        source={require('../../../assets/animations/ledger-verify.json')}
        autoPlay
        loop={false}
      />
    </PopupContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: Dimensions.get('window').width,
  },
});
