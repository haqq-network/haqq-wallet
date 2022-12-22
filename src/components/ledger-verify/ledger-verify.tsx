import React, {useEffect} from 'react';

import {StyleSheet} from 'react-native';

import {LottieWrap, PopupContainer, Text} from '@app/components/ui';
import {captureException} from '@app/helpers';
import {runUntil} from '@app/helpers/run-until';
import {I18N} from '@app/i18n';
import {ETH_HD_PATH, WINDOW_WIDTH} from '@app/variables/common';

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
      <Text t9 i18n={I18N.ledgerVerifyAddress} i18params={{address}} center />
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
    width: WINDOW_WIDTH,
  },
});
