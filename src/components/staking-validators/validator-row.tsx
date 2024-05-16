import React, {useCallback, useMemo} from 'react';

import {TouchableWithoutFeedback, View} from 'react-native';

import {Color} from '@app/colors';
import {Text, TextVariant} from '@app/components/ui';
import {InfoBox} from '@app/components/ui/info-box';
import {createTheme} from '@app/helpers';
import {cleanNumber} from '@app/helpers/clean-number';
import {formatPercents} from '@app/helpers/format-percents';
import {useMinAmount} from '@app/hooks/use-min-amount';
import {I18N} from '@app/i18n';
import {ValidatorItem, ValidatorStatus} from '@app/types';
import {WEI} from '@app/variables/common';

import {ValidatorAvatar} from './validator-avatar';

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

  const votingPowerPercents = useMemo(() => {
    return item.power ? cleanNumber(item.power) : null;
  }, [item.power]);

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
    <TouchableWithoutFeedback
      testID={'validator-' + item.description.moniker}
      onPress={onPressRow}>
      <View>
        <View style={styles.container}>
          <ValidatorAvatar identity={item.description.identity} />
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text variant={TextVariant.t11}>{item.description.moniker}</Text>
              <Text variant={TextVariant.t11}>{validatorCommission}%</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.powerRow}>
                <Text
                  variant={TextVariant.t14}
                  color={Color.textBase2}
                  i18n={I18N.stakingValidatorsRowPower}
                  i18params={{power: cleanNumber(votingPower)}}
                />
                {votingPowerPercents && (
                  <Text variant={TextVariant.t14} color={Color.textBase2}>
                    {` · ${votingPowerPercents}%`}
                  </Text>
                )}
              </View>
              <Text
                variant={TextVariant.t14}
                color={textColor}
                i18n={item.localStatus as unknown as I18N}
              />
            </View>
          </View>
        </View>
        <View style={styles.badges}>
          {!!item.localDelegations &&
            item.localDelegations > minAmount.toFloat() && (
              <InfoBox
                style={styles.badge}
                i18n={I18N.stakingValidatorsRowStaked}
                i18params={{
                  staked: cleanNumber(item.localDelegations),
                }}
              />
            )}
          {!!item.localRewards && item.localRewards > minAmount.toFloat() && (
            <InfoBox
              style={styles.badge}
              i18n={I18N.stakingValidatorsRowReward}
              i18params={{
                reward: cleanNumber(item.localRewards),
              }}
            />
          )}
          {!!item.localUnDelegations &&
            item.localUnDelegations > minAmount.toFloat() && (
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
  powerRow: {
    flexDirection: 'row',
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
