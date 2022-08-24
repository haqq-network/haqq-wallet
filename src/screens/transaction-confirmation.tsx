import {Text} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {Container} from '../components/container';
import {Button, ButtonVariant} from '../components/ui';
import {useTransactions} from '../contexts/transactions';

type SendTransactionScreenProp = CompositeScreenProps<any, any>;

export const TransactionConfirmationScreen = ({
  navigation,
  route,
}: SendTransactionScreenProp) => {
  const transactions = useTransactions();
  const {from, to, amount} = route.params;

  const [estimateFee, setEstimateFee] = useState(0);

  const onDone = useCallback(async () => {
    const transaction = await transactions.sendTransaction(
      from,
      to,
      parseFloat(amount),
    );

    if (transaction) {
      navigation.navigate('transaction-finish', {
        hash: transaction.hash,
      });
    }
  }, [transactions, from, to, amount, navigation]);

  useEffect(() => {
    transactions
      .estimateTransaction(from, to, amount)
      .then(result => setEstimateFee(result));
  }, [from, to, amount, transactions]);

  return (
    <Container>
      <Text>{from}</Text>
      <Text>{to}</Text>
      <Text>{amount}</Text>
      <Text>{estimateFee.toFixed(8)}</Text>
      <Button
        disabled={estimateFee === 0}
        variant={ButtonVariant.contained}
        title="Send"
        onPress={onDone}
      />
    </Container>
  );
};
