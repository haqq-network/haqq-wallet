import React, {useCallback, useMemo} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {format} from 'date-fns';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {BottomSheet} from '@app/components/bottom-sheet';
import {TransactionStatus} from '@app/components/transaction-status/transaction-status';
import {DataContent, Icon, IconButton, Text} from '@app/components/ui';
import {cleanNumber, createTheme} from '@app/helpers';
import {useCalculatedDimensionsValue} from '@app/hooks/use-calculated-dimensions-value';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Transaction} from '@app/models/transaction';
import {Wallet} from '@app/models/wallet';
import {sendNotification} from '@app/services';
import {Balance} from '@app/services/balance';
import {TransactionSource} from '@app/types';
import {splitAddress} from '@app/utils';
import {IS_IOS, LONG_NUM_PRECISION} from '@app/variables/common';

type TransactionDetailProps = {
  source: TransactionSource;
  onCloseBottomSheet: () => void;
  transaction: Transaction;
  provider: (Provider & Realm.Object<unknown, never>) | null;
  onPressInfo: () => void;
  contractName?: string;
};

export const TransactionDetail = ({
  source,
  onCloseBottomSheet,
  transaction,
  provider,
  onPressInfo,
  contractName,
}: TransactionDetailProps) => {
  const adressList = Wallet.addressList();
  const isSent =
    source === TransactionSource.send || adressList.includes(transaction.from);
  const isContract = source === TransactionSource.contract;
  const to = isSent ? transaction.to : ' ';
  const from = transaction?.from ? transaction.from : ' ';

  const title = useMemo(() => {
    const titleMap = {
      [TransactionSource.send]: I18N.transactionDetailSent,
      [TransactionSource.receive]: I18N.transactionDetailRecive,
      [TransactionSource.contract]: I18N.transactionContractTitle,
      // Only for ts check. Possible values is: send, receive, contract
      [TransactionSource.date]: I18N.empty,
      [TransactionSource.unknown]: I18N.empty,
    };

    return titleMap[source];
  }, [source]);

  const splitted = useMemo(
    () => splitAddress(isSent ? to : from),
    [from, isSent, to],
  );
  const closeDistance = useCalculatedDimensionsValue(({height}) => height / 4);
  const onPressAddress = useCallback(() => {
    Clipboard.setString(isSent ? to : from);
    sendNotification(I18N.notificationCopied);
  }, [from, isSent, to]);

  const total = useMemo(() => {
    if (!transaction) {
      return '';
    }

    if (source === TransactionSource.contract) {
      return `${isSent ? '-' : '+'} ${cleanNumber(
        transaction.value + (isSent ? transaction.fee : 0),
      )}`;
    }

    if (source === TransactionSource.send) {
      return `- ${cleanNumber(transaction.value + transaction.fee)}`;
    }

    return `+ ${cleanNumber(transaction.value)}`;
  }, [transaction, source, isSent]);

  const fee = useMemo(
    () =>
      new Balance(transaction.feeHex || transaction.fee).toBalanceString(
        LONG_NUM_PRECISION,
      ),
    [transaction],
  );

  if (!transaction) {
    return null;
  }

  return (
    <BottomSheet
      onClose={onCloseBottomSheet}
      i18nTitle={title}
      closeDistance={closeDistance}>
      {!total && (
        <>
          <Text
            i18n={I18N.transactionDetailTotalAmount}
            t14
            style={styles.amount}
          />
          <Text
            t6
            color={isSent ? Color.textRed1 : Color.textGreen1}
            style={styles.sum}
            i18n={I18N.transactionConfirmationAmount}
            i18params={{amount: total}}
          />
        </>
      )}
      <View style={styles.infoContainer}>
        <DataContent
          title={format(transaction.createdAt, 'dd MMMM yyyy, HH:mm')}
          subtitleI18n={I18N.transactionDetailDate}
          reversed
          short
        />
        <DataContent
          reversed
          subtitleI18n={
            isSent ? I18N.transactionSendTitle : I18N.transactionReceiveTitle
          }
          title={<TransactionStatus status={transaction.status} hasTitle />}
        />
        {!isContract && (
          <DataContent
            title={
              <>
                {splitted[0]}
                <Text color={Color.textBase2}>{splitted[1]}</Text>
                {splitted[2]}
              </>
            }
            numberOfLines={2}
            subtitleI18n={
              isSent
                ? I18N.transactionDetailSentTo
                : I18N.transactionDetailReciveFrom
            }
            reversed
            short
            onPress={onPressAddress}
          />
        )}
        {isContract && contractName && (
          <DataContent
            subtitleI18n={I18N.transactionDetailContractName}
            title={contractName}
            numberOfLines={2}
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
                Islamic Coin <Text color={Color.textBase2}>(ISLM)</Text>
              </Text>
            </>
          }
          subtitleI18n={I18N.transactionDetailCryptocurrency}
          reversed
          short
        />
        {provider && (
          <DataContent
            title={provider.name}
            subtitleI18n={I18N.transactionDetailNetwork}
            reversed
            short
          />
        )}
        {!isContract && (
          <DataContent
            titleI18n={I18N.transactionConfirmationAmount}
            titleI18nParams={{amount: cleanNumber(transaction.value)}}
            subtitleI18n={I18N.transactionDetailAmount}
            reversed
            short
          />
        )}
        <DataContent
          title={fee}
          subtitleI18n={I18N.transactionDetailNetworkFee}
          reversed
          short
        />
        {isContract && (
          <DataContent
            subtitleI18n={I18N.transactionDetailTransactionType}
            titleI18n={I18N.transactionDetailTransactionTypeDescription}
            numberOfLines={2}
            reversed
          />
        )}
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
  amount: {marginBottom: 2, color: Color.textBase2},
  icon: {
    marginRight: IS_IOS ? 4 : 2,
    top: IS_IOS ? 1 : 2,
  },
  iconView: {top: IS_IOS ? -1.7 : 0},
  iconButton: {flexDirection: 'row', marginBottom: 50},
  textStyle: {marginLeft: 8},
});
