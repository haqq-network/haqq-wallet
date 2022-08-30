import {StyleSheet, Text, View} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {Container} from '../components/container';
import {
  Button,
  ButtonVariant,
  DataView,
  ISLMIcon,
  Paragraph,
} from '../components/ui';
import {useTransactions} from '../contexts/transactions';
import {BG_3, GRAPHIC_GREEN_1, TEXT_BASE_1, TEXT_BASE_2} from '../variables';
import {Spacer} from '../components/spacer';

type SendTransactionScreenProp = CompositeScreenProps<any, any>;

export const TransactionConfirmationScreen = ({
  navigation,
  route,
}: SendTransactionScreenProp) => {
  const transactions = useTransactions();
  const {from, to, amount, fee} = route.params;

  const [estimateFee, setEstimateFee] = useState(fee ?? 0);
  const [error, setError] = useState('');

  const onDone = useCallback(async () => {
    try {
      const transaction = await transactions.sendTransaction(
        from,
        to,
        parseFloat(amount),
      );

      if (transaction) {
        navigation.navigate('transactionFinish', {
          hash: transaction.hash,
        });
        transactions.emit('transactions');
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
    }
  }, [transactions, from, to, amount, navigation]);

  useEffect(() => {
    transactions
      .estimateTransaction(from, to, amount)
      .then(result => setEstimateFee(result));
  }, [from, to, amount, transactions]);

  return (
    <Container>
      <ISLMIcon color={GRAPHIC_GREEN_1} style={page.icon} />

      <Paragraph style={page.subtitle}>Total Amount</Paragraph>
      <Text style={page.sum}>{(amount + estimateFee).toFixed(8)} ISLM</Text>
      <Paragraph style={page.subtitle}>Send to</Paragraph>
      <Paragraph style={page.address}>{to}</Paragraph>

      <View style={page.info}>
        <DataView label="Cryptocurrency">
          <Paragraph style={{color: TEXT_BASE_1}}>
            Islamic coin <Text style={{color: TEXT_BASE_2}}>(ISLM)</Text>
          </Paragraph>
        </DataView>
        <DataView label="Network">
          <Paragraph style={{color: TEXT_BASE_1}}>
            HAQQ blockchain <Text style={{color: TEXT_BASE_2}}>(HQ)</Text>
          </Paragraph>
        </DataView>
        <DataView label="Amount">
          <Paragraph style={{color: TEXT_BASE_1}}>
            {amount.toFixed(8)} ISLM
          </Paragraph>
        </DataView>
        <DataView label="Network Fee">
          <Paragraph style={{color: TEXT_BASE_1}}>
            {estimateFee.toFixed(8)} ISLM
          </Paragraph>
        </DataView>
      </View>
      <Spacer />
      {error && <Text>{error}</Text>}
      <Button
        disabled={estimateFee === 0}
        variant={ButtonVariant.contained}
        title="Send"
        onPress={onDone}
      />
    </Container>
  );
};

const page = StyleSheet.create({
  address: {marginBottom: 40, textAlign: 'center', color: TEXT_BASE_1},
  subtitle: {textAlign: 'center', marginBottom: 4},
  icon: {marginBottom: 16, alignSelf: 'center'},
  info: {borderRadius: 16, backgroundColor: BG_3},
  sum: {
    marginBottom: 16,
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 38,
    textAlign: 'center',
    color: TEXT_BASE_1,
  },
});
