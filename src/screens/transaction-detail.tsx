import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {format} from 'date-fns';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';

import {RootStackParamList, TransactionSource} from '../types';
import {useTransactions} from '../contexts/transactions';
import {Transaction} from '../models/transaction';
import {BottomSheet} from '../components/bottom-sheet';
import {
  BlockIcon,
  DataContent,
  DataContentSplitted,
  IconButton,
  ISLMIcon,
  Text,
} from '../components/ui';

import {
  BG_3,
  GRAPHIC_BASE_1,
  GRAPHIC_GREEN_1,
  TEXT_BASE_2,
  TEXT_GREEN_1,
  TEXT_RED_1,
} from '../variables';
import {splitAddress} from '../utils';
import {isIOS, openURL} from '../helpers';
import {EthNetwork} from '../services/eth-network';

export const TransactionDetailScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'transactionDetail'>>();

  const transactions = useTransactions();
  const [transaction, setTransaction] = useState<Transaction | undefined>(
    transactions.getTransaction(route.params.hash),
  );

  const isSent = transaction?.source === TransactionSource.send;
  const to = isSent ? transaction.to : ' ';
  const from = transaction?.from ? transaction.from : ' ';

  useEffect(() => {
    setTransaction(transactions.getTransaction(route.params.hash));
  }, [route.params.hash, transactions]);

  const onPressInfo = useCallback(async () => {
    try {
      const url = `${EthNetwork.explorer}tx/${transaction?.hash}/internal-transactions`;
      await openURL(url);
    } catch (_e) {}
  }, [transaction?.hash]);

  const title = isSent ? 'Sent' : 'Receive';
  const titleAddress = isSent ? 'Send to' : 'Received from';

  const splitted = useMemo(
    () => (isSent ? splitAddress(to) : splitAddress(from)),
    [from, isSent, to],
  );

  if (!transaction) {
    return null;
  }

  const onCloseBottomSheet = () => {
    navigation.canGoBack() && navigation.goBack();
  };

  return (
    <BottomSheet onClose={onCloseBottomSheet} title={title}>
      <Text t14 style={page.amount}>
        Total amount
      </Text>
      <Text t6 style={[page.sum, isSent ? page.sumSent : page.sumReceive]}>
        {transaction.totalFormatted} ISLM
      </Text>
      {/*<Text t14 style={page.subSum}>*/}
      {/*  - {(transaction?.value + transaction?.fee).toFixed(8)} ISLM*/}
      {/*</Text>*/}
      <View style={page.infoContainer}>
        <DataContent
          title={format(transaction.createdAt, 'dd MMMM yyyy, HH:mm')}
          subtitle="Date"
          reversed
          style={page.info}
        />
        {isSent ? (
          <DataContentSplitted
            to={splitted}
            title={titleAddress}
            style={page.info}
            reversed
          />
        ) : (
          <DataContentSplitted
            to={splitted}
            title={titleAddress}
            style={page.info}
            reversed
          />
        )}
        <DataContent
          title={
            <>
              <View style={page.iconView}>
                <ISLMIcon
                  width={16}
                  height={16}
                  color={GRAPHIC_GREEN_1}
                  style={page.icon}
                />
              </View>
              <Text t11>
                {' '}
                Islamic coin{' '}
                <Text clean style={page.subInfo}>
                  (ISLM)
                </Text>
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
              HAQQ blockchain{' '}
              <Text clean style={page.subInfo}>
                (HQ)
              </Text>
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
        <Text t9 style={page.textStyle}>
          View on block explorer
        </Text>
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
  amount: {marginBottom: 2, color: TEXT_BASE_2},
  icon: {
    marginRight: isIOS ? 4 : 2,
    top: isIOS ? 1 : 2,
    width: 16,
    height: 16,
  },
  iconView: {top: isIOS ? -1.7 : 0},
  iconButton: {flexDirection: 'row', marginBottom: 50},
  textStyle: {marginLeft: 8},
  subInfo: {color: TEXT_BASE_2},
});
