import React, {useCallback, useMemo} from 'react';

import {ScrollView, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color, getColor} from '@app/colors';
import {Badge, Button, ButtonVariant, Text} from '@app/components/ui';
import {createTheme, openURL, windowWidth} from '@app/helpers';
import {formatPercents} from '@app/helpers/format-percents';
import {I18N, getText} from '@app/i18n';
import {ValidatorItem, ValidatorStatus} from '@app/types';
import {cleanNumber} from '@app/utils';
import {GWEI} from '@app/variables';

import {Block} from './block';
import {Markdown} from './markdown';

export type StakingInfoProps = {
  validator: ValidatorItem;
};

export type Commission = {
  current: number;
  max: number;
  maxChange: number;
};

export const StakingInfo = ({validator}: StakingInfoProps) => {
  const insets = useSafeAreaInsets();
  const textColor = useMemo(() => {
    switch (validator.localStatus) {
      case ValidatorStatus.active:
        return Color.textGreen1;
      case ValidatorStatus.inactive:
        return Color.textYellow1;
      case ValidatorStatus.jailed:
        return Color.textRed1;
      default:
        return Color.textBase1;
    }
  }, [validator.localStatus]);

  const votingPower = useMemo(() => {
    return parseInt(validator.tokens ?? '0', 10) / GWEI;
  }, [validator.tokens]);

  const onPressWebsite = useCallback(() => {
    openURL(validator.description.website);
  }, [validator.description.website]);

  const onPressStake = useCallback(() => {}, []);

  const commission = useMemo(
    () => ({
      current: formatPercents(validator.commission.commission_rates.rate),
      max: formatPercents(validator.commission.commission_rates.max_rate),
      maxChange: formatPercents(
        validator.commission.commission_rates.max_change_rate,
      ),
    }),
    [validator.commission],
  );

  return (
    <>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text t5 center style={styles.title}>
          {validator.description.moniker}
        </Text>
        <Badge
          text={getText(validator.localStatus as number)}
          color={getColor(textColor)}
          style={styles.badge}
        />
        <View style={styles.infoBlock}>
          <Block name={getText(I18N.stakingInfoVotingPower)}>
            <Text t14>{cleanNumber(votingPower.toFixed(2))}</Text>
          </Block>
          <Block name={getText(I18N.stakingInfoCommission)}>
            <View style={styles.infoBlockCommissions}>
              <View style={styles.infoBlockCommission}>
                <Text i18n={I18N.stakingInfoCommissionCurrent} t14 />
                <Text t10>{commission.current}%</Text>
              </View>
              <View style={styles.infoBlockCommission}>
                <Text
                  i18n={I18N.stakingInfoCommissionMax}
                  t14
                  color={Color.textBase2}
                />
                <Text t11 color={Color.textBase2}>
                  {commission.max}%
                </Text>
              </View>
              <View style={styles.infoBlockCommission}>
                <Text
                  i18n={I18N.stakingInfoCommissionMaxChange}
                  t14
                  color={Color.textBase2}
                />
                <Text t11 color={Color.textBase2}>
                  {commission.maxChange}%
                </Text>
              </View>
            </View>
          </Block>
          {validator.description.website && (
            <Block name={getText(I18N.stakingInfoWebsite)}>
              <Text
                t14
                color={getColor(Color.textGreen1)}
                onPress={onPressWebsite}>
                {validator.description.website}
              </Text>
            </Block>
          )}
        </View>
        <Block name={getText(I18N.stakingInfoAddress)}>
          <Text t14 color={getColor(Color.textBase2)}>
            {validator.operator_address}
          </Text>
        </Block>
        {validator.description.details && (
          <Block name={getText(I18N.stakingInfoDetail)}>
            <Markdown>{validator.description.details}</Markdown>
          </Block>
        )}
      </ScrollView>
      <View
        style={StyleSheet.compose(styles.footer as StyleProp<ViewStyle>, {
          paddingBottom: insets.bottom + 20,
        })}>
        <Button
          variant={ButtonVariant.contained}
          title={getText(I18N.stakingInfoStake)}
          onPress={onPressStake}
        />
      </View>
    </>
  );
};

const styles = createTheme({
  contentContainer: {
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
  },
  badge: {
    marginBottom: 24,
  },
  infoBlock: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Color.bg8,
    width: windowWidth - 40,
    borderRadius: 12,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Color.bg1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  infoBlockCommissions: {
    flexDirection: 'row',
    marginHorizontal: -12,
  },
  infoBlockCommission: {
    marginHorizontal: 12,
  },
});
