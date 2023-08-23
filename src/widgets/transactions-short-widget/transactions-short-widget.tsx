import React, {useMemo} from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {Spacer, Text} from '@app/components/ui';
import {BarChart} from '@app/components/ui/bar-chart';
import {ShadowCard} from '@app/components/ui/shadow-card';
import {WidgetHeader} from '@app/components/ui/widget-header';
import {cleanNumber} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {
  LIGHT_TEXT_BASE_1,
  LIGHT_TEXT_BASE_2,
  MIN_AMOUNT,
} from '@app/variables/common';

type Props = {
  onPress: () => void;
  received: number;
  spend: number;
};

export const TransactionsShortWidget = ({onPress, received, spend}: Props) => {
  const total = Math.max(received + spend, MIN_AMOUNT.toNumber());

  const barInfo = useMemo(() => {
    return [
      {
        id: '0',
        title: '',
        percentage: received / total,
        color: Color.graphicBase1,
      },
      {
        id: '1',
        title: '',
        percentage: spend / total,
        color: Color.graphicBase2,
      },
    ];
  }, [received, spend, total]);

  return (
    <ShadowCard onPress={onPress} style={styles.wrapper}>
      <WidgetHeader title={getText(I18N.transactionWidgetTitle)} />
      <View style={styles.textWrapper}>
        <Text t14 color={LIGHT_TEXT_BASE_1}>
          {getText(I18N.transactionWidgetReceiveTitle, {
            value: cleanNumber(received),
          })}
        </Text>
        <Spacer width={10} height={2} />
        <Text t14 color={LIGHT_TEXT_BASE_2}>
          {getText(I18N.transactionWidgetSpendTitle, {
            value: cleanNumber(spend),
          })}
        </Text>
      </View>
      <BarChart hideText data={barInfo} />
    </ShadowCard>
  );
};

const styles = StyleSheet.create({
  textWrapper: {flexDirection: 'row', marginVertical: 8, flexWrap: 'wrap'},
  wrapper: {paddingHorizontal: 16},
});
