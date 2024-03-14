import React, {memo, useCallback, useMemo} from 'react';

import {toJS} from 'mobx';
import {TouchableWithoutFeedback, View} from 'react-native';

import {CardSmall, DataContent, Icon, Spacer, Text} from '@app/components/ui';
import {AddressUtils} from '@app/helpers/address-utils';
import {Transaction} from '@app/models/transaction';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {Color, createTheme} from '@app/theme';
import {STRINGS} from '@app/variables/common';

import {TransactionStatus} from './transaction-status';

import {ImageWrapper} from '../image-wrapper';

export interface TransactionRowProps {
  item: Transaction;
  addresses: string[];
  withPadding?: boolean;

  onPress(tx: Transaction): void;
}

export const TransactionRow = memo(
  ({
    item: _item,
    addresses,
    withPadding = false,
    onPress,
  }: TransactionRowProps) => {
    const item = useMemo(() => toJS(_item), [_item]);
    const handlePress = useCallback(() => {
      onPress?.(item);
    }, [item]);

    const amount = useMemo(() => {
      // if array length greater than 1, it's a multi token cosmos IBC tx
      const balances = item.parsed.amount;
      if (balances.length === 1) {
        return balances[0];
      }

      return Balance.Empty;
    }, [item]);

    const token = useMemo(() => {
      const tokensInfo = item.parsed.tokens;
      if (tokensInfo.length === 1) {
        return tokensInfo[0];
      }
      return undefined;
    }, [item]);

    const amoutColor = useMemo(() => {
      if (item.parsed.isIncoming) {
        return Color.textGreen1;
      }

      if (item.parsed.isOutcoming) {
        return Color.textRed1;
      }

      return Color.textBase1;
    }, [item, addresses]);

    const amountPrefix = useMemo(() => {
      if (item.parsed.isIncoming) {
        return '+';
      }

      if (item.parsed.isOutcoming) {
        return '-';
      }

      return '';
    }, [item, addresses]);

    const amountInFiat = useMemo(() => amount.toFiat({fixed: 4}), [amount]);

    const wallet = useMemo(() => {
      let address = '';

      if (item.parsed.isIncoming) {
        address = item.parsed.to;
      }

      if (item.parsed.isOutcoming) {
        address = item.parsed.from;
      }

      if (address.length) {
        return Wallet.getById(AddressUtils.toEth(address));
      }
    }, []);

    return (
      <TouchableWithoutFeedback onPress={handlePress}>
        <View
          style={[styles.container, withPadding && styles.containerPadding]}>
          <View style={styles.iconWrapper}>
            <Icon name={item.parsed.icon} color={Color.graphicBase1} />
            {!!token && (
              <View style={styles.tokenIconWrapper}>
                <ImageWrapper source={token.icon} style={styles.tokenIcon} />
              </View>
            )}
          </View>
          <DataContent
            style={styles.infoContainer}
            title={
              <View style={styles.titleWrapper}>
                <Text children={item.parsed.title} color={Color.textBase1} />
                <TransactionStatus status={item.code} />
              </View>
            }
            subtitle={
              <View style={styles.subtitleContainer}>
                {!!wallet && (
                  <>
                    <CardSmall
                      width={23}
                      height={16}
                      borderRadius={4}
                      withPadding={false}
                      pattern={wallet.pattern}
                      colorFrom={wallet.colorFrom}
                      colorTo={wallet.colorTo}
                      colorPattern={wallet.colorPattern}
                    />
                    <Spacer width={4} />
                  </>
                )}
                <View>
                  <Text t14 color={Color.textBase2}>
                    {item.parsed.subtitle}
                  </Text>
                </View>
              </View>
            }
            short
          />

          {amount.isPositive() && (
            <View style={styles.amountWrapper}>
              <Text
                t11
                color={amoutColor}
                ellipsizeMode="middle"
                numberOfLines={1}>
                {amountPrefix}
                {STRINGS.NBSP}
                {amount.toBalanceString('auto')}
              </Text>
              <Spacer height={2} />
              <Text
                t14
                color={Color.textBase2}
                ellipsizeMode="middle"
                numberOfLines={1}>
                {Boolean(amountInFiat) && amountPrefix}
                {STRINGS.NBSP}
                {amount.toFiat({fixed: 4})}
              </Text>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    );
  },
);

const styles = createTheme({
  amountWrapper: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    flex: 1,
  },
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
  subtitleContainer: {
    flexDirection: 'row',
  },
});
