import {StyleSheet, View} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {
  Button,
  ButtonVariant,
  DataView,
  ISLMIcon,
  Paragraph,
  PopupContainer,
  Spacer,
} from '../components/ui';
import {useTransactions} from '../contexts/transactions';
import {BG_3, GRAPHIC_GREEN_2, TEXT_BASE_1, TEXT_BASE_2} from '../variables';
import {useContacts} from '../contexts/contacts';
import {useWallet} from '../contexts/wallets';
import {splitAddress} from '../utils';

type SendTransactionScreenProp = CompositeScreenProps<any, any>;

export const TransactionConfirmationScreen = ({
  navigation,
  route,
}: SendTransactionScreenProp) => {
  const {from, to, amount, fee} = route.params;
  const contacts = useContacts();
  const transactions = useTransactions();
  const wallet = useWallet(from);

  const [estimateFee, setEstimateFee] = useState(fee ?? 0);
  const [error, setError] = useState('');
  const [disabled, setDisabled] = useState(false);

  const contact = useMemo(
    () => contacts.getContact(route.params.to),
    [contacts, route.params.to],
  );

  const splittedTo = useMemo(() => splitAddress(to), [to]);

  const onDone = useCallback(async () => {
    if (wallet) {
      try {
        setDisabled(true);
        const transaction = await transactions.sendTransaction(
          from,
          to,
          parseFloat(amount),
          estimateFee,
          wallet,
        );
        console.log('transaction', transaction);
        if (transaction) {
          navigation.navigate('transactionFinish', {
            hash: transaction.hash,
          });
        }
      } catch (e) {
        console.log('onDone', e);
        if (e instanceof Error) {
          setError(e.message);
        }
      } finally {
        setDisabled(false);
      }
    }
  }, [wallet, transactions, from, to, amount, estimateFee, navigation]);

  useEffect(() => {
    transactions
      .estimateTransaction(from, to, amount)
      .then(result => setEstimateFee(result));
  }, [from, to, amount, transactions]);

  return (
    <PopupContainer style={page.container}>
      <ISLMIcon color={GRAPHIC_GREEN_2} style={page.icon} />
      <Paragraph style={page.subtitle}>Total Amount</Paragraph>
      <Paragraph clean style={page.sum}>
        {(amount + estimateFee).toFixed(8)} ISLM
      </Paragraph>
      <Paragraph style={page.subtitle}>Send to</Paragraph>
      {contact && <Paragraph style={page.contact}>{contact.name}</Paragraph>}
      <Paragraph style={page.address}>
        <Paragraph clean>{splittedTo[0]}</Paragraph>
        <Paragraph clean style={{color: TEXT_BASE_2}}>
          {splittedTo[1]}
        </Paragraph>
        <Paragraph clean>{splittedTo[2]}</Paragraph>
      </Paragraph>

      <View style={page.info}>
        <DataView label="Cryptocurrency">
          <Paragraph style={{color: TEXT_BASE_1}}>
            Islamic coin{' '}
            <Paragraph clean style={{color: TEXT_BASE_2}}>
              (ISLM)
            </Paragraph>
          </Paragraph>
        </DataView>
        <DataView label="Network">
          <Paragraph style={{color: TEXT_BASE_1}}>
            HAQQ blockchain{' '}
            <Paragraph clean style={{color: TEXT_BASE_2}}>
              (HQ)
            </Paragraph>
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
      {error && <Paragraph clean>{error}</Paragraph>}
      <Spacer />
      <Button
        disabled={estimateFee === 0 && !disabled}
        variant={ButtonVariant.contained}
        title="Send"
        onPress={onDone}
        style={page.submit}
      />
    </PopupContainer>
  );
};

const page = StyleSheet.create({
  container: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  contact: {
    textAlign: 'center',
    color: TEXT_BASE_1,
    marginHorizontal: 27.5,
    fontWeight: '600',
  },
  address: {
    marginBottom: 40,
    textAlign: 'center',
    color: TEXT_BASE_1,
    marginHorizontal: 27.5,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 4,
  },
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
  submit: {
    marginVertical: 16,
  },
});
