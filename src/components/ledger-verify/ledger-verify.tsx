import React, {useEffect} from 'react';
import {LottieWrap, PopupContainer, Text} from '../ui';
import {Dimensions, StyleSheet} from 'react-native';
import {runUntil} from '../../helpers/run-until';
import {ETH_HD_PATH} from '../../variables';
import {captureException} from '../../helpers';

export type LedgerInfo = {
  address: string;
};

export type LedgerVerifyProps = {
  deviceId: string;
  address: string;
  onDone: (info: LedgerInfo) => void;
};

export const LedgerVerify = ({
  deviceId,
  onDone,
  address,
}: LedgerVerifyProps) => {
  useEffect(() => {
    const iter = runUntil(deviceId, eth => eth.getAddress(ETH_HD_PATH, true));
    requestAnimationFrame(async () => {
      try {
        let verifiedAddress = null;
        let done = false;
        do {
          const resp = await iter.next();
          done = resp.done;
          if (resp.value) {
            verifiedAddress = resp.value.address;
          }
        } while (!done);
        if (verifiedAddress) {
          onDone({
            address: verifiedAddress,
          });
        }
      } catch (e) {
        captureException(e, 'LedgerVerify');
      }
    });

    return () => {
      iter.abort();
    };
  }, [deviceId, onDone]);

  return (
    <PopupContainer style={styles.container}>
      <Text t9 style={styles.text}>
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
  text: {
    textAlign: 'center',
  },
});
