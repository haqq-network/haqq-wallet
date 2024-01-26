import React from 'react';

import {Image, View} from 'react-native';

import {Color} from '@app/colors';
import {BottomSheet} from '@app/components/bottom-sheet';
import {TransactionStatus} from '@app/components/transaction-status/transaction-status';
import {DataContent, Icon, IconButton, Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useCalculatedDimensionsValue} from '@app/hooks/use-calculated-dimensions-value';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Transaction} from '@app/models/transaction';
import {Balance} from '@app/services/balance';
import {IndexerTxParsedTokenInfo} from '@app/types';
import {IS_IOS, LONG_NUM_PRECISION, STRINGS} from '@app/variables/common';

type TransactionDetailProps = {
  transaction: Transaction;
  provider: (Provider & Realm.Object<unknown, never>) | null;
  contractName?: string;
  isSent: boolean;
  isContract: boolean;
  title: string;
  timestamp: string;
  splitted: string[];
  amount: Balance;
  fee: Balance;
  total: Balance;
  isCosmosTx: boolean;
  isEthereumTx: boolean;
  tokenInfo: IndexerTxParsedTokenInfo;
  onPressAddress: () => void;
  onCloseBottomSheet: () => void;
  onPressInfo: () => void;
};

export const TransactionDetail = ({
  transaction,
  provider,
  contractName,
  isSent,
  isContract,
  title,
  timestamp,
  splitted,
  amount,
  fee,
  total,
  tokenInfo,
  isEthereumTx,
  onPressAddress,
  onPressInfo,
  onCloseBottomSheet,
}: TransactionDetailProps) => {
  const closeDistance = useCalculatedDimensionsValue(({height}) => height / 4);

  if (!transaction) {
    return null;
  }

  return (
    <BottomSheet
      onClose={onCloseBottomSheet}
      title={title}
      closeDistance={closeDistance}>
      {total.isPositive() && (
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
            children={total.toBalanceString(LONG_NUM_PRECISION)}
          />
          <Spacer height={2} />
          <Text
            t13
            color={Color.textBase2}
            children={total.toFiat('USD').toBalanceString()}
          />
          <Spacer height={20} />
        </>
      )}
      <View style={styles.infoContainer}>
        <DataContent
          title={timestamp}
          subtitleI18n={I18N.transactionDetailDate}
          reversed
          short
        />
        <DataContent
          reversed
          subtitleI18n={
            isSent ? I18N.transactionSendTitle : I18N.transactionReceiveTitle
          }
          title={<TransactionStatus status={transaction.code} hasTitle />}
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
        {isContract && !!contractName && (
          <DataContent
            subtitleI18n={I18N.transactionDetailContractName}
            title={contractName}
            numberOfLines={2}
            reversed
          />
        )}
        {isEthereumTx && (
          <DataContent
            title={
              <>
                <View style={styles.iconView}>
                  <Image source={tokenInfo.icon} style={styles.icon} />
                </View>
                <Text t11>
                  {tokenInfo.name}
                  {STRINGS.NBSP}
                  <Text color={Color.textBase2}>({tokenInfo.symbol})</Text>
                </Text>
              </>
            }
            subtitleI18n={I18N.transactionDetailCryptocurrency}
            reversed
            short
          />
        )}
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
            title={amount.toBalanceString()}
            subtitleI18n={I18N.transactionDetailAmount}
            reversed
            short
          />
        )}
        <DataContent
          title={fee.toBalanceString(LONG_NUM_PRECISION)}
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
    width: 16,
    height: 16,
  },
  iconView: {top: IS_IOS ? -1.7 : 0},
  iconButton: {flexDirection: 'row', marginBottom: 50},
  textStyle: {marginLeft: 8},
});
