import React, {useCallback, useEffect, useState} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {NETWORK_EXPLORER} from '@env';
import {format} from 'date-fns';

import {useTransactions} from '../contexts/transactions';
import {TransactionType} from '../models/transaction';
import {BottomSheet} from '../components/bottom-sheet';
import {
  BlockIcon,
  DataContent,
  IconButton,
  ISLMIcon,
  Paragraph,
  ParagraphSize,
} from '../components/ui';
import {Linking, StyleSheet, Text, View} from 'react-native';
import {
  BG_3,
  GRAPHIC_BASE_1,
  GRAPHIC_GREEN_1,
  TEXT_BASE_1,
  TEXT_BASE_2,
  TEXT_RED_1,
} from '../variables';

type TransactionDetailScreenProp = CompositeScreenProps<any, any>;

export const TransactionDetailScreen = ({
  route,
  navigation,
}: TransactionDetailScreenProp) => {
  const transactions = useTransactions();
  const [transaction, setTransaction] = useState<TransactionType | null>(
    transactions.getTransaction(route.params.hash),
  );

  useEffect(() => {
    setTransaction(transactions.getTransaction(route.params.hash));
  }, [route.params.hash]);

  const onPressInfo = useCallback(async () => {
    const url = `${NETWORK_EXPLORER}tx/${transaction?.hash}/internal-transactions`;
    await Linking.canOpenURL(url);
    await Linking.openURL(url);
  }, [transaction?.hash]);

  if (!transaction) {
    return null;
  }

  return (
    <BottomSheet onClose={navigation.goBack} title="Sent">
      <Paragraph size={ParagraphSize.s} style={{marginBottom: 2}}>
        Total amount
      </Paragraph>
      <Paragraph size={ParagraphSize.xl} style={page.sum}>
        - {(transaction?.value + transaction?.fee).toFixed(8)} ISLM
      </Paragraph>
      <Paragraph size={ParagraphSize.s} style={page.subSum}>
        - {(transaction?.value + transaction?.fee).toFixed(8)} ISLM
      </Paragraph>
      <View style={page.infoContainer}>
        <DataContent
          title={format(transaction.createdAt, 'dd MMMM yyyy, HH:mm')}
          subtitle="Date"
          reversed
          style={page.info}
        />
        <DataContent
          title={transaction.to}
          subtitle="Send to"
          reversed
          style={page.info}
        />
        <DataContent
          title={
            <>
              <ISLMIcon
                width={16}
                height={16}
                color={GRAPHIC_GREEN_1}
                style={{marginRight: 4}}
              />
              <Text>
                Islamic coin <Text style={{color: TEXT_BASE_2}}>(ISLM)</Text>
              </Text>
            </>
          }
          subtitle="Cryptocurrency"
          reversed
          style={page.info}
        />
        <DataContent
          title={
            <>
              HAQQ blockchain <Text style={{color: TEXT_BASE_2}}>(HQ)</Text>
            </>
          }
          subtitle="Network"
          reversed
          style={page.info}
        />
        <DataContent
          title={`${transaction.value.toFixed(8)} ISLM`}
          subtitle="Amount"
          reversed
          style={page.info}
        />
        <DataContent
          title={`${transaction.fee.toFixed(8)} ISLM`}
          subtitle="Fee"
          reversed
          style={page.info}
        />
      </View>
      <IconButton
        onPress={onPressInfo}
        style={{flexDirection: 'row', marginBottom: 50}}>
        <BlockIcon color={GRAPHIC_BASE_1} />
        <Paragraph
          style={{marginLeft: 8, color: TEXT_BASE_1, fontWeight: '700'}}>
          View on block explorer
        </Paragraph>
      </IconButton>
    </BottomSheet>
  );
};

const page = StyleSheet.create({
  sum: {
    marginBottom: 2,
    fontWeight: '700',
    color: TEXT_RED_1,
  },
  subSum: {
    color: TEXT_BASE_2,
    marginBottom: 20,
    fontWeight: '600',
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
});
