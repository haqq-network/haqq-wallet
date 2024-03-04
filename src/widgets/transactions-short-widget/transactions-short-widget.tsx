import React, {memo, useMemo} from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {Spacer, Text} from '@app/components/ui';
import {BarChart} from '@app/components/ui/bar-chart';
import {ShadowCard} from '@app/components/ui/shadow-card';
import {WidgetHeader} from '@app/components/ui/widget-header';
import {useMinAmount} from '@app/hooks/use-min-amount';
import {I18N, getText} from '@app/i18n';
import {Balance} from '@app/services/balance';

type Props = {
  spend: Balance;
  received: Balance;
  isTransactionsLoading: boolean;
  onPress: () => void;
};

export const TransactionsShortWidget = memo(
  ({onPress, received, spend}: Props) => {
    const minAmount = useMinAmount();
    const total = useMemo(
      () =>
        Math.max(spend.operate(received, 'add').toFloat(), minAmount.toFloat()),
      [spend, received, minAmount],
    );

    const barInfo = useMemo(() => {
      return [
        {
          id: '0',
          title: '',
          percentage: received.toFloat() / total,
          color: Color.graphicBase1,
        },
        {
          id: '1',
          title: '',
          percentage: spend.toFloat() / total,
          color: Color.graphicBase2,
        },
      ];
    }, [received, spend, total]);

    return (
      <ShadowCard onPress={onPress} style={styles.wrapper}>
        <WidgetHeader title={getText(I18N.transactionWidgetTitle)} />
        <View style={styles.textWrapper}>
          <Text t14 color={Color.textBase1}>
            {getText(I18N.transactionWidgetReceiveTitle, {
              value: received.toBalanceString(),
            })}
          </Text>
          <Spacer width={10} height={2} />
          <Text t14 color={Color.textBase2}>
            {getText(I18N.transactionWidgetSpendTitle, {
              value: spend.toBalanceString(),
            })}
          </Text>
        </View>
        <BarChart hideText data={barInfo} />
      </ShadowCard>
    );
  },
);

const styles = StyleSheet.create({
  textWrapper: {flexDirection: 'row', marginVertical: 8, flexWrap: 'wrap'},
  wrapper: {paddingHorizontal: 16},
});
