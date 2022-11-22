import React, {useCallback, useMemo} from 'react';

import {TouchableWithoutFeedback, View} from 'react-native';

import {Color, getColor} from '@app/colors';
import {ArrowSend, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {formatPercents} from '@app/helpers/format-percents';
import {getText} from '@app/i18n';
import {ValidatorItem, ValidatorStatus} from '@app/types';
import {cleanNumber} from '@app/utils';
import {GWEI} from '@app/variables';

export type ValidatorRowProps = {
  item: ValidatorItem;
  onPress: (validator: ValidatorItem) => void;
};
export const ValidatorRow = ({onPress, item}: ValidatorRowProps) => {
  const validatorCommission = useMemo(() => {
    return formatPercents(item.commission.commission_rates.rate);
  }, [item.commission.commission_rates]);

  const votingPower = useMemo(() => {
    return parseInt(item.tokens ?? '0', 10) / GWEI;
  }, [item.tokens]);

  const onPressRow = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  const textColor = useMemo(() => {
    switch (item.localStatus) {
      case ValidatorStatus.active:
        return Color.textGreen1;
      case ValidatorStatus.inactive:
        return Color.textYellow1;
      case ValidatorStatus.jailed:
        return Color.textRed1;
      default:
        return Color.textBase1;
    }
  }, [item.localStatus]);

  return (
    <TouchableWithoutFeedback onPress={onPressRow}>
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <ArrowSend color={getColor(Color.graphicBase1)} />
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text t11>{item.description.moniker}</Text>
            <Text t11>{validatorCommission}%</Text>
          </View>
          <View style={styles.infoRow}>
            <Text t14 color={getColor(Color.textBase2)}>
              Power {cleanNumber(votingPower.toFixed(2))}
            </Text>
            <Text t14 color={getColor(textColor)}>
              {getText(item.localStatus as number)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = createTheme({
  container: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  infoContainer: {marginLeft: 12, flex: 1},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 1,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    backgroundColor: Color.bg3,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
