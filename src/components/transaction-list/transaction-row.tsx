import React, {useCallback, useMemo} from 'react';

import {Image, TouchableWithoutFeedback, View} from 'react-native';

import {Color} from '@app/colors';
import {DataContent, Icon, Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {IndexerTransactionUtils} from '@app/helpers/indexer-transaction-utils';
import {Transaction} from '@app/models/transaction';
import {STRINGS} from '@app/variables/common';

import {TransactionStatus} from './transaction-status';
import {ItemData} from './types';

export interface TransactionRowProps {
  data: ItemData;
  addresses: string[];
  onPress(tx: Transaction): void;
}

export const TransactionRow = ({
  data,
  addresses,
  onPress,
}: TransactionRowProps) => {
  const item = data.item;

  const handlePress = useCallback(() => {
    onPress?.(data.item);
  }, []);

  const {title, subtitle} = useMemo(
    () => IndexerTransactionUtils.getDescription(item, addresses),
    [item, addresses],
  );

  const iconName = useMemo(
    () => IndexerTransactionUtils.getIconName(item, addresses),
    [item, addresses],
  );

  const amount = useMemo(() => IndexerTransactionUtils.getAmount(item), [item]);
  const tokenInfo = useMemo(
    () => IndexerTransactionUtils.getTokenInfo(item),
    [item],
  );

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
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <Icon name={iconName} color={Color.graphicBase1} />
          <View style={styles.tokenIconWrapper}>
            <Image source={tokenInfo.icon} style={styles.tokenIcon} />
          </View>
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
  container: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
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
