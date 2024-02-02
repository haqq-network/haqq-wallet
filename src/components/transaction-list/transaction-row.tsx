import React, {useCallback, useMemo} from 'react';

import {Image, TouchableWithoutFeedback, View} from 'react-native';

import {Color} from '@app/colors';
import {DataContent, Icon, Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {IndexerTransactionUtils} from '@app/helpers/indexer-transaction-utils';
import {Transaction} from '@app/models/transaction';
import {Balance} from '@app/services/balance';
import {IndexerTransaction} from '@app/types';
import {STRINGS} from '@app/variables/common';

import {TransactionStatus} from './transaction-status';

export interface TransactionRowProps {
  item: IndexerTransaction;
  addresses: string[];
  withPadding?: boolean;
  onPress(tx: Transaction): void;
}

export const TransactionRow = ({
  item,
  addresses,
  withPadding = false,
  onPress,
}: TransactionRowProps) => {
  const handlePress = useCallback(() => {
    onPress?.(item);
  }, [item]);

  const {title, subtitle} = useMemo(
    () => IndexerTransactionUtils.getDescription(item, addresses),
    [item, addresses],
  );

  const iconName = useMemo(
    () => IndexerTransactionUtils.getIconName(item, addresses),
    [item, addresses],
  );

  const amount = useMemo(() => {
    // if array length greater than 1, it's a multi token cosmos IBC tx
    const balances = IndexerTransactionUtils.getAmount(item);
    if (balances.length === 1) {
      return balances[0];
    }

    return Balance.Empty;
  }, [item]);

  const tokensInfo = useMemo(
    () => IndexerTransactionUtils.getTokensInfo(item),
    [item],
  );

  const token = useMemo(() => {
    if (tokensInfo.length === 1) {
      return tokensInfo[0];
    }
    return undefined;
  }, [tokensInfo]);

  const amoutColor = useMemo(() => {
    if (IndexerTransactionUtils.isIncomingTx(item, addresses)) {
      return Color.textGreen1;
    }

    if (IndexerTransactionUtils.isOutcomingTx(item, addresses)) {
      return Color.textRed1;
    }

    return Color.textBase1;
  }, [item, addresses]);

  const amoutPrefix = useMemo(() => {
    if (IndexerTransactionUtils.isIncomingTx(item, addresses)) {
      return '+';
    }

    if (IndexerTransactionUtils.isOutcomingTx(item, addresses)) {
      return '-';
    }

    return '';
  }, [item, addresses]);

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={[styles.container, withPadding && styles.containerPadding]}>
        <View style={styles.iconWrapper}>
          <Icon name={iconName} color={Color.graphicBase1} />
          {token && (
            <View style={styles.tokenIconWrapper}>
              <Image source={token.icon} style={styles.tokenIcon} />
            </View>
          )}
        </View>
        <DataContent
          style={styles.infoContainer}
          title={
            <View style={styles.titleWrapper}>
              <Text children={title} color={Color.textBase1} />
              <TransactionStatus status={item.code} />
            </View>
          }
          subtitle={subtitle}
          short
        />

        {amount.isPositive() && (
          <View style={styles.amountWrapper}>
            <Text t11 color={amoutColor}>
              {amoutPrefix}
              {STRINGS.NBSP}
              {amount.toBalanceString()}
            </Text>
            <Spacer height={2} />
            <Text t14 color={Color.textBase2}>
              {amoutPrefix}
              {STRINGS.NBSP}
              {amount.toFiat('USD').toBalanceString()}
            </Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = createTheme({
  amountWrapper: {flexDirection: 'column', alignItems: 'flex-end'},
  containerPadding: {
    paddingVertical: 4,
    paddingHorizontal: 20,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContainer: {
    marginLeft: 12,
    flex: 1,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    backgroundColor: Color.bg3,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenIconWrapper: {
    position: 'absolute',
    backgroundColor: Color.bg3,
    borderColor: Color.bg3,
    borderWidth: 2,
    borderRadius: 20,
    top: -2,
    right: -8,
  },
  tokenIcon: {
    width: 16,
    height: 16,
    borderRadius: 20,
  },
});
