import React from 'react';

import {StyleSheet} from 'react-native';

import {LottieWrap, PopupContainer, Text} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {WINDOW_WIDTH} from '@app/variables/common';

export type LedgerInfo = {
  address: string;
};

export type LedgerVerifyProps = {
  address: string;
};

export const LedgerVerify = ({address}: LedgerVerifyProps) => {
  return (
    <PopupContainer style={styles.container}>
      <Text t9 i18n={I18N.ledgerVerifyAddress} i18params={{address}} center />
      <LottieWrap
        style={styles.lottie}
        source={require('@assets/animations/ledger-verify.json')}
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
