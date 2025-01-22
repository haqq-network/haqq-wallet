import React, {useCallback, useMemo} from 'react';

import {observer} from 'mobx-react';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {BottomSheet} from '@app/components/bottom-sheet';
import {TransactionStatus} from '@app/components/transaction-status/transaction-status';
import {
  DataContent,
  Icon,
  IconButton,
  Spacer,
  Text,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {useCalculatedDimensionsValue} from '@app/hooks/use-calculated-dimensions-value';
import {I18N, getText} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Token} from '@app/models/tokens';
import {Transaction} from '@app/models/transaction';
import {Balance} from '@app/services/balance';
import {IndexerTxMsgType} from '@app/types';
import {IS_IOS, LONG_NUM_PRECISION, STRINGS} from '@app/variables/common';

import {AddressHighlight} from './address-highlight';
import {ImageWrapper} from './image-wrapper';

type TransactionDetailProps = {
  tx: Transaction;
  timestamp: string;
  fee: Balance;
  total: Balance;
  onCloseBottomSheet: () => void;
  onPressInfo: () => void;
  onPressSpenderAddress: (address: string) => void;
};

export const TransactionDetail = observer(
  ({
    tx,
    timestamp,
    fee,
    total,
    onPressInfo,
    onCloseBottomSheet,
    onPressSpenderAddress,
  }: TransactionDetailProps) => {
    const closeDistance = useCalculatedDimensionsValue(
      ({height}) => height / 4,
    );
    const contractTo = useMemo(() => {
      if (tx.parsed.isContractInteraction) {
        return Token.getById(AddressUtils.toHaqq(tx.parsed.to));
      }
      return null;
    }, [tx]);
    const provider = useMemo(() => Provider.getByEthChainId(tx.chain_id), []);

    const handlePressSpenderAddress = useCallback(() => {
      if (tx.msg.type === IndexerTxMsgType.msgEthereumApprovalTx) {
        onPressSpenderAddress?.(tx.msg.spender);
      }
    }, [tx]);

    return (
      <BottomSheet
        onClose={onCloseBottomSheet}
        title={tx.parsed.title}
        closeDistance={closeDistance}>
        {total.isPositive() && (
          <>
            <Text
              i18n={I18N.transactionDetailTotalAmount}
              variant={TextVariant.t14}
              style={styles.amount}
            />
            <Text
              variant={TextVariant.t6}
              color={tx.parsed.isOutcoming ? Color.textRed1 : Color.textGreen1}
              style={styles.sum}>
              {total.toBalanceString(LONG_NUM_PRECISION)}
            </Text>
            <Spacer height={2} />
            <Text variant={TextVariant.t13} color={Color.textBase2}>
              {total.toFiat({fixed: LONG_NUM_PRECISION})}
            </Text>
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
              tx.parsed.isOutcoming
                ? I18N.transactionSendTitle
                : I18N.transactionReceiveTitle
            }
            title={<TransactionStatus status={tx.code} hasTitle />}
          />
          {!tx.parsed.isContractInteraction && (
            <AddressHighlight
              title={
                tx.parsed.isOutcoming
                  ? I18N.transactionDetailSentTo
                  : I18N.transactionDetailReciveFrom
              }
              address={tx.parsed.isOutcoming ? tx.parsed.to : tx.parsed.from}
            />
          )}
          {!!contractTo && (
            <DataContent
              subtitleI18n={I18N.transactionDetailContractName}
              title={contractTo.name}
              numberOfLines={2}
              reversed
            />
          )}
          {tx.msg.type === IndexerTxMsgType.msgEthereumApprovalTx && (
            <DataContent
              subtitle={getText(I18N.transactionDetailApproveSpenderTitle)}
              title={AddressUtils.toEth(tx.msg.spender)}
              numberOfLines={2}
              onPress={handlePressSpenderAddress}
              reversed
              titleColor={Color.textBlue1}
            />
          )}
          {!!provider?.id && (
            <DataContent
              title={provider.name}
              subtitleI18n={I18N.transactionDetailNetwork}
              reversed
              short
            />
          )}
          {tx.parsed.tokens.map((token, i) => {
            const balance = tx.parsed.amount[i];
            return (
              <React.Fragment key={`${token.contract_address}-${i}`}>
                <DataContent
                  title={
                    <>
                      <View style={styles.iconView}>
                        <ImageWrapper source={token.icon} style={styles.icon} />
                      </View>
                      <Spacer width={4} />
                      <Text variant={TextVariant.t11}>
                        {token.symbol}
                        {STRINGS.NBSP}
                        <Text color={Color.textBase2}>({token.name})</Text>
                      </Text>
                    </>
                  }
                  subtitleI18n={I18N.transactionDetailCryptocurrency}
                  reversed
                  short
                />

                {balance?.isPositive() && (
                  <DataContent
                    title={balance.toBalanceString(LONG_NUM_PRECISION)}
                    subtitleI18n={I18N.transactionDetailAmount}
                    reversed
                    short
                  />
                )}
              </React.Fragment>
            );
          })}
          {fee.isPositive() && (
            <DataContent
              title={fee.toBalanceString(LONG_NUM_PRECISION)}
              subtitleI18n={I18N.transactionDetailNetworkFee}
              reversed
              short
            />
          )}
          {tx.parsed.isContractInteraction &&
            !tx.parsed.amount?.[0]?.isPositive?.() && (
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
            variant={TextVariant.t9}
            i18n={I18N.transactionDetailViewOnBlock}
            style={styles.textStyle}
          />
        </IconButton>
      </BottomSheet>
    );
  },
);

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
