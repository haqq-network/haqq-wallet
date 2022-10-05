import React, {useCallback, useEffect, useState} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {NETWORK_EXPLORER} from '@env';
import {format} from 'date-fns';

import {useTransactions} from '../contexts/transactions';
import {Transaction} from '../models/transaction';
import {BottomSheet} from '../components/bottom-sheet';
import {
  BlockIcon,
  DataContent,
  IconButton,
  ISLMIcon,
  Paragraph,
} from '../components/ui';
import {Linking, StyleSheet, View} from 'react-native';
import {
  BG_3,
  GRAPHIC_BASE_1,
  GRAPHIC_GREEN_1,
  TEXT_BASE_1,
  TEXT_BASE_2,
  TEXT_GREEN_1,
  TEXT_RED_1,
} from '../variables';
import {TransactionSource} from '../types';

type TransactionDetailScreenProp = CompositeScreenProps<any, any>;

export const TransactionDetailScreen = ({
  route,
  navigation,
}: TransactionDetailScreenProp) => {
  const transactions = useTransactions();
  const [transaction, setTransaction] = useState<Transaction | null>(
    transactions.getTransaction(route.params.hash),
  );

  useEffect(() => {
    setTransaction(transactions.getTransaction(route.params.hash));
  }, [route.params.hash, transactions]);

  const onPressInfo = useCallback(async () => {
    try {
      const url = `${NETWORK_EXPLORER}tx/${transaction?.hash}/internal-transactions`;
      await Linking.canOpenURL(url);
      await Linking.openURL(url);
    } catch (_e) {}
  }, [transaction?.hash]);

  const title =
    transaction?.source === TransactionSource.send ? 'Send' : 'Receive';

  if (!transaction) {
    return null;
  }

  return (
    <BottomSheet onClose={navigation.goBack} title={title}>
      <Paragraph p3 style={page.p3}>
        Total amount
      </Paragraph>
      <Paragraph
        p0
        style={[
          page.sum,
          transaction.source === TransactionSource.send
            ? page.sumSent
            : page.sumReceive,
        ]}>
        {transaction.totalFormatted} ISLM
      </Paragraph>
      {/*<Paragraph p3 style={page.subSum}>*/}
      {/*  - {(transaction?.value + transaction?.fee).toFixed(8)} ISLM*/}
      {/*</Paragraph>*/}
      <View style={page.infoContainer}>
        <DataContent
          title={format(transaction.createdAt, 'dd MMMM yyyy, HH:mm')}
          subtitle="Date"
          reversed
          style={page.info}
        />
        {transaction?.source === TransactionSource.send ? (
          <DataContent
            title={transaction.to}
            subtitle="Send to"
            reversed
            style={page.info}
          />
        ) : (
          <DataContent
            title={transaction.from}
            subtitle="Received from"
            reversed
            style={page.info}
          />
        )}
        <DataContent
          title={
            <>
              <ISLMIcon
                width={16}
                height={16}
                color={GRAPHIC_GREEN_1}
                style={page.icon}
              />
              <Paragraph clean>
                Islamic coin{' '}
                <Paragraph clean style={{color: TEXT_BASE_2}}>
                  (ISLM)
                </Paragraph>
              </Paragraph>
            </>
          }
          subtitle="Cryptocurrency"
          reversed
          style={page.info}
        />
        <DataContent
          title={
            <>
              HAQQ blockchain{' '}
              <Paragraph clean style={{color: TEXT_BASE_2}}>
                (HQ)
              </Paragraph>
            </>
          }
          subtitle="Network"
          reversed
          style={page.info}
        />
        <DataContent
          title={`${transaction.valueFormatted} ISLM`}
          subtitle="Amount"
          reversed
          style={page.info}
        />
        <DataContent
          title={`${transaction.feeFormatted} ISLM`}
          subtitle="Network Fee"
          reversed
          style={page.info}
        />
      </View>
      <IconButton onPress={onPressInfo} style={page.iconButton}>
        <BlockIcon color={GRAPHIC_BASE_1} />
        <Paragraph style={page.textStyle}>View on block explorer</Paragraph>
      </IconButton>
    </BottomSheet>
  );
};

const page = StyleSheet.create({
  sum: {
    marginBottom: 20,
    fontWeight: '700',
    color: TEXT_RED_1,
  },
  sumSent: {
    color: TEXT_RED_1,
  },
  sumReceive: {
    color: TEXT_GREEN_1,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    backgroundColor: BG_3,
    borderRadius: 16,
    marginBottom: 24,
  },
  info: {
    marginVertical: 8,
  },
  p3: {marginBottom: 2},
  icon: {marginRight: 4},
  iconButton: {flexDirection: 'row', marginBottom: 50},
  textStyle: {marginLeft: 8, color: TEXT_BASE_1, fontWeight: '700'},
});
