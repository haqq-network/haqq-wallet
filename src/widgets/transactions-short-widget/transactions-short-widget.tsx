import React from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {Spacer, Text} from '@app/components/ui';
import {BarChart} from '@app/components/ui/bar-chart';
import {ShadowCard} from '@app/components/ui/shadow-card';
import {WidgetHeader} from '@app/components/ui/widget-header';
import {cleanNumber} from '@app/helpers';
import {LIGHT_TEXT_BASE_1, LIGHT_TEXT_BASE_2} from '@app/variables/common';

type Props = {
  onPress: () => void;
  received: number;
  spend: number;
};

const TransactionsShortWidget = ({onPress, received, spend}: Props) => {
  const total = Math.max(received + spend, 0.001);
  return (
    <ShadowCard onPress={onPress} style={styles.wrapper}>
      <WidgetHeader title={'Transactions'} />
      <View style={styles.textWrapper}>
        <Text t14 color={LIGHT_TEXT_BASE_1}>
          {`Received ${cleanNumber(received)} ISLM`}
        </Text>
        <Spacer width={10} height={2} />
        <Text t14 color={LIGHT_TEXT_BASE_2}>
          {`Spend ${cleanNumber(spend)} ISLM`}
        </Text>
      </View>
      <BarChart
        hideText
        data={[
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
        ]}
      />
    </ShadowCard>
  );
};

const styles = StyleSheet.create({
  textWrapper: {flexDirection: 'row', marginVertical: 8},
  wrapper: {paddingHorizontal: 16},
});

export {TransactionsShortWidget};
