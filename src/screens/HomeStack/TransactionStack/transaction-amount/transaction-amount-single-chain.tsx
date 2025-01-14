import {observer} from 'mobx-react';
import {KeyboardAvoidingView} from 'react-native';

import {createTheme} from '@app/helpers';

import {TransactionAmountCoin} from './transaction-amount-coin';

export const TransactionAmountSingleChain = observer(() => {
  return (
    <KeyboardAvoidingView style={styles.container}>
      <TransactionAmountCoin />
    </KeyboardAvoidingView>
  );
});

const styles = createTheme({
  container: {
    flex: 1,
  },
});
