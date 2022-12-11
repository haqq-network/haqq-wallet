import React, {useMemo} from 'react';

import {format} from 'date-fns';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {BottomSheet} from '@app/components/bottom-sheet';
import {
  DataContent,
  DataContentSplitted,
  Icon,
  IconButton,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Transaction} from '@app/models/transaction';
import {TransactionSource} from '@app/types';
import {splitAddress} from '@app/utils';
import {IS_IOS} from '@app/variables';

type TransactionDetailProps = {
  onCloseBottomSheet: () => void;
  transaction: Transaction;
  provider: (Provider & Realm.Object<unknown, never>) | null;
  onPressInfo: () => void;
};

export const TransactionDetail = ({
  onCloseBottomSheet,
  transaction,
  provider,
  onPressInfo,
}: TransactionDetailProps) => {
  const isSent = transaction?.source === TransactionSource.send;
  const to = isSent ? transaction.to : ' ';
  const from = transaction?.from ? transaction.from : ' ';

  const title = isSent
    ? getText(I18N.transactionDetailSent)
    : getText(I18N.transactionDetailRecive);
  const titleAddress = isSent
    ? getText(I18N.transactionDetailSentTo)
    : getText(I18N.transactionDetailReciveFrom);

  const splitted = useMemo(
    () => (isSent ? splitAddress(to) : splitAddress(from)),
    [from, isSent, to],
  );

  if (!transaction) {
    return null;
  }

  return (
    <BottomSheet onClose={onCloseBottomSheet} title={title}>
      <Text
        i18n={I18N.transactionDetailTotalAmount}
        t14
        style={styles.amount}
      />
      <Text
        t6
        color={isSent ? Color.textRed1 : Color.textGreen1}
        style={styles.sum}>
        {transaction.totalFormatted} ISLM
      </Text>
      {/*<Text t14 style={page.subSum}>*/}
      {/*  - {(transaction?.value + transaction?.fee).toFixed(8)} ISLM*/}
      {/*</Text>*/}
      <View style={styles.infoContainer}>
        <DataContent
          title={format(transaction.createdAt, 'dd MMMM yyyy, HH:mm')}
          subtitleI18n={I18N.transactionDetailDate}
          reversed
          style={styles.info}
        />
        {isSent ? (
          <DataContentSplitted
            to={splitted}
            title={titleAddress}
            style={styles.info}
            reversed
          />
        ) : (
          <DataContentSplitted
            to={splitted}
            title={titleAddress}
            style={styles.info}
            reversed
          />
        )}
        <DataContent
          title={
            <>
              <View style={styles.iconView}>
                <Icon
                  name="islm"
                  style={styles.icon}
                  i16
                  color={Color.graphicGreen1}
                />
              </View>
              <Text t11>
                {' '}
                Islamic Coin{' '}
                <Text clean color={Color.textBase2}>
                  (ISLM)
                </Text>
              </Text>
            </>
          }
          subtitle="Cryptocurrency"
          reversed
          style={styles.info}
        />
        {provider && (
          <DataContent
            title={provider.name}
            subtitleI18n={I18N.transactionDetailNetwork}
            reversed
            style={styles.info}
          />
        )}
        <DataContent
          title={`${transaction.valueFormatted} ISLM`}
          subtitleI18n={I18N.transactionDetailAmount}
          reversed
          style={styles.info}
        />
        <DataContent
          title={`${transaction.feeFormatted} ISLM`}
          subtitle="Network Fee"
          subtitleI18n={I18N.transactionDetailNetworkFee}
          reversed
          style={styles.info}
        />
      </View>
      <IconButton onPress={onPressInfo} style={styles.iconButton}>
        <Icon name="block" color={Color.graphicBase1} />
        <Text
          t9
          i18n={I18N.transactionDetailViewOnBlock}
          style={styles.textStyle}
        />
      </IconButton>
    </BottomSheet>
  );
};

const styles = createTheme({
  sum: {
    marginBottom: 20,
    fontWeight: '700',
    color: Color.textRed1,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    backgroundColor: Color.bg3,
    borderRadius: 16,
    marginBottom: 24,
  },
  info: {
    marginVertical: 8,
  },
  amount: {marginBottom: 2, color: Color.textBase2},
  icon: {
    marginRight: IS_IOS ? 4 : 2,
    top: IS_IOS ? 1 : 2,
  },
  iconView: {top: IS_IOS ? -1.7 : 0},
  iconButton: {flexDirection: 'row', marginBottom: 50},
  textStyle: {marginLeft: 8},
});
