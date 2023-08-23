import React, {useCallback, useMemo} from 'react';

import {TouchableWithoutFeedback, View} from 'react-native';

import {Color} from '@app/colors';
import {Icon, Text} from '@app/components/ui';
import {InfoBox} from '@app/components/ui/info-box';
import {createTheme} from '@app/helpers';
import {cleanNumber} from '@app/helpers/clean-number';
import {formatPercents} from '@app/helpers/format-percents';
import {useMinAmount} from '@app/hooks/use-min-amount';
import {I18N} from '@app/i18n';
import {ValidatorItem, ValidatorStatus} from '@app/types';
import {WEI} from '@app/variables/common';

export type ValidatorRowProps = {
  item: ValidatorItem;
  onPress: (validator: ValidatorItem) => void;
};
export const ValidatorRow = ({onPress, item}: ValidatorRowProps) => {
  const minAmount = useMinAmount();

  const validatorCommission = useMemo(() => {
    return formatPercents(item.commission.commission_rates.rate);
  }, [item.commission.commission_rates]);

  const votingPower = useMemo(() => {
    return parseInt(item.tokens ?? '0', 10) / WEI;
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
      <View>
        <View style={styles.container}>
          <View style={styles.iconWrapper}>
            <Icon name="servers" color={Color.graphicBase1} />
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text t11>{item.description.moniker}</Text>
              <Text t11>{validatorCommission}%</Text>
            </View>
            <View style={styles.infoRow}>
              <Text
                t14
                color={Color.textBase2}
                i18n={I18N.stakingValidatorsRowPower}
                i18params={{power: cleanNumber(votingPower)}}
              />
              <Text t14 color={textColor} i18n={item.localStatus as number} />
            </View>
          </View>
        </View>
        <View style={styles.badges}>
          {!!item.localDelegations &&
            item.localDelegations > minAmount.toNumber() && (
              <InfoBox
                style={styles.badge}
                i18n={I18N.stakingValidatorsRowStaked}
                i18params={{
                  staked: cleanNumber(item.localDelegations),
                }}
              />
            )}
          {!!item.localRewards && item.localRewards > minAmount.toNumber() && (
            <InfoBox
              style={styles.badge}
              i18n={I18N.stakingValidatorsRowReward}
              i18params={{
                reward: cleanNumber(item.localRewards),
              }}
            />
          )}
          {!!item.localUnDelegations &&
            item.localUnDelegations > minAmount.toNumber() && (
              <InfoBox
                style={styles.badge}
                i18n={I18N.stakingValidatorsRowWithdrawal}
              />
            )}
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
  badges: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginHorizontal: 15,
    marginBottom: 6,
  },
  badge: {
    marginHorizontal: 5,
    marginVertical: 2,
  },
});
