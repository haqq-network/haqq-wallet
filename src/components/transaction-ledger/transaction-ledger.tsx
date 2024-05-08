import React, {useMemo} from 'react';

import {useWindowDimensions} from 'react-native';

import {LottieWrap, PopupContainer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Balance} from '@app/services/balance';

export type TransactionVerifyProps = {
  from: string;
  to: string;
  amount: Balance;
};

export const TransactionLedger = ({}: TransactionVerifyProps) => {
  const screenWidth = useWindowDimensions().width;

  const lottie = useMemo(
    () => ({width: screenWidth, height: 200}),
    [screenWidth],
  );

  return (
    <PopupContainer style={styles.container}>
      <Text i18n={I18N.transactionLedgerBluetoothConfirmation} t9 center />
      <LottieWrap
        style={lottie}
        source={require('@assets/animations/transaction-ledger.json')}
        autoPlay
        loop={false}
      />
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
