import React, {useMemo} from 'react';

import {isFuture} from 'date-fns';
import {View, useWindowDimensions} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {Balance} from '@app/services/balance';

import {DashedLine} from './dashed-line';
import {Icon, IconButton, IconsName, Spacer, Text, TextVariant} from './ui';
import {BarChart} from './ui/bar-chart';
import {BarChartItem} from './ui/bar-chart/bar-chart-item';

export interface StackedVestedTokensProps {
  lockedBalance?: Balance;
  vestedBalance?: Balance;
  stakingBalance?: Balance;
  availableBalance?: Balance;
  unlock: Date;
  onPressInfo(): void;
  totalBalance?: Balance;
}

const calculateDistanceToNow = (endDate: Date) => {
  const diff = Math.abs(endDate.getTime() - new Date().getTime());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}min`;
};

export function StackedVestedTokens({
  availableBalance = Balance.Empty,
  lockedBalance = Balance.Empty,
  stakingBalance = Balance.Empty,
  vestedBalance = Balance.Empty,
  onPressInfo,
  unlock,
  totalBalance,
}: StackedVestedTokensProps) {
  const {width} = useWindowDimensions();
  const vestedUnlockDescription = useMemo(() => {
    if (!unlock) {
      return '';
    }
    const isValid = isFuture(unlock);
    if (!isValid) {
      return '';
    }

    return getText(I18N.lockedTokensVestedAvailableIn, {
      value: calculateDistanceToNow(unlock),
    });
  }, [unlock]);

  const barChartData = useMemo(() => {
    const onePercent = lockedBalance.operate(100, 'div');

    return [
      {
        id: 'vested',
        percentage: vestedBalance.operate(onePercent, 'div').toFloat(),
        color: Color.textYellow1,
        title:
          getText(I18N.lockedTokensVested, {
            count: vestedBalance.toFloatString(),
          }) + vestedUnlockDescription,
      },
      {
        id: 'staking',
        percentage: stakingBalance.operate(onePercent, 'div').toFloat(),
        color: Color.textBlue1,
        title: getText(I18N.lockedTokensStaked, {
          count: stakingBalance.toFloatString(),
        }),
      },
    ] as BarChartItem[];
  }, [lockedBalance, stakingBalance, vestedBalance]);

  return (
    <View style={styles.container}>
      {!!totalBalance && (
        <>
          <View style={styles.row}>
            <Icon i20 color={Color.graphicBase1} name={IconsName.islm} />
            <Spacer width={4} />
            <Text
              variant={TextVariant.t10}
              color={Color.textBase1}
              i18n={I18N.totalAvailable}
              i18params={{count: totalBalance?.toFloatString() ?? '0'}}
            />
            <Text
              variant={TextVariant.t10}
              color={Color.textBase2}
              children={' ' + totalBalance?.currency}
            />
          </View>
          <DashedLine
            style={styles.separator}
            width={width - 40}
            color={Color.graphicSecond2}
          />
        </>
      )}
      <View style={styles.row}>
        <Icon i20 color={Color.graphicBase1} name={IconsName.coin} />
        <Spacer width={4} />
        <Text
          variant={TextVariant.t10}
          color={Color.textBase1}
          i18n={I18N.lockedTokensAvailable}
          i18params={{count: availableBalance?.toFloatString() ?? '0'}}
        />
        <Text
          variant={TextVariant.t10}
          color={Color.textBase2}
          children={' ' + availableBalance.currency}
        />
      </View>
      {lockedBalance?.isPositive() && (
        <>
          <DashedLine
            style={styles.separator}
            width={width - 40}
            color={Color.graphicSecond2}
          />
          <View style={styles.row}>
            <Icon i20 color={Color.graphicBase1} name={IconsName.lock} />
            <Spacer width={4} />
            <Text
              variant={TextVariant.t10}
              color={Color.textBase1}
              i18n={I18N.lockedTokensLocked}
              i18params={{count: lockedBalance.toFloatString()}}
            />
            <Text
              variant={TextVariant.t10}
              color={Color.textBase2}
              children={' ' + lockedBalance.currency}
            />
            <Spacer width={4} />
            <IconButton onPress={onPressInfo}>
              <Icon i20 color={Color.graphicBase2} name={IconsName.info} />
            </IconButton>
          </View>
          <Spacer height={8} />
          <BarChart data={barChartData} />
        </>
      )}
    </View>
  );
}

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Color.graphicSecond1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    marginVertical: 8,
  },
});
