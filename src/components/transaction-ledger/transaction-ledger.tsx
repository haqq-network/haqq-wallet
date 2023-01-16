import React from 'react';

import {useWindowDimensions} from 'react-native';

import {LottieWrap, PopupContainer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

export type TransactionVerifyProps = {
  from: string;
  to: string;
  amount: number;
};

export const TransactionLedger = ({}: TransactionVerifyProps) => {
  const screenWidth = useWindowDimensions().width;

  return (
    <PopupContainer style={styles.container}>
      <Text i18n={I18N.transactionLedgerBluetoothConfirmation} t9 center />
      <LottieWrap
        style={{width: screenWidth}}
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
