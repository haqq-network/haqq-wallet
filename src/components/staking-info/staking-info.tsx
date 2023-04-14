import React, {useCallback, useMemo} from 'react';

import {ScrollView, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {Block} from '@app/components/staking-info/block';
import {Markdown} from '@app/components/staking-info/markdown';
import {
  Badge,
  Button,
  ButtonVariant,
  CopyButton,
  Icon,
  InfoBlock,
  InfoBlockAmount,
  Inline,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme, openURL} from '@app/helpers';
import {cleanNumber} from '@app/helpers/clean-number';
import {formatPercents} from '@app/helpers/format-percents';
import {formatStakingDate, reduceAmounts} from '@app/helpers/staking';
import {I18N} from '@app/i18n';
import {StakingMetadata} from '@app/models/staking-metadata';
import {ValidatorItem, ValidatorStatus} from '@app/types';
import {NUM_PRECISION, WEI} from '@app/variables/common';

export type StakingInfoProps = {
  withdrawDelegatorRewardProgress: boolean;
  delegations: StakingMetadata[];
  rewards: StakingMetadata[];
  unDelegations: StakingMetadata[];
  validator: ValidatorItem;
  onDelegate: () => void;
  onUnDelegate: () => void;
  onWithdrawDelegatorReward: () => void;
};

export const StakingInfo = ({
  validator: {
    localStatus,
    operator_address,
    tokens,
    description: {website, moniker, details},
    commission: {commission_rates},
  },
  onDelegate,
  onUnDelegate,
  unDelegations,
  delegations,
  rewards,
  onWithdrawDelegatorReward,
  withdrawDelegatorRewardProgress,
}: StakingInfoProps) => {
  const insets = useSafeAreaInsets();

  const [labelColor, textColor, isActive] = useMemo(() => {
    switch (localStatus) {
      case ValidatorStatus.active:
        return [Color.textGreen1, undefined, true];
      case ValidatorStatus.inactive:
        return [Color.bg6, Color.textYellow1, false];
      case ValidatorStatus.jailed:
        return [Color.textRed1, undefined, false];
      default:
        return [Color.textBase1];
    }
  }, [localStatus]);

  const staked = useMemo(() => reduceAmounts(delegations), [delegations]);
  const reward = useMemo(() => reduceAmounts(rewards), [rewards]);
  const undelegated = useMemo(
    () =>
      unDelegations.map(a => ({
        amount: a.amount,
        suffix: formatStakingDate(a.completion_time),
      })),
    [unDelegations],
  );

  const votingPower = useMemo(() => {
    return parseInt(tokens ?? '0', 10) / WEI;
  }, [tokens]);

  const onPressWebsite = useCallback(() => {
    openURL(website);
  }, [website]);

  const commission = useMemo(
    () => ({
      current: formatPercents(commission_rates.rate),
      max: formatPercents(commission_rates.max_rate),
      maxChange: formatPercents(commission_rates.max_change_rate),
    }),
    [commission_rates],
  );

  return (
    <>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Spacer height={24} />
        <View style={styles.iconContainer}>
          <Icon color={Color.graphicBase1} name="servers" i24 />
        </View>
        <Spacer height={16} />
        <Text t5 center style={styles.title}>
          {moniker}
        </Text>
        <Badge
          center
          i18n={localStatus as number}
          labelColor={labelColor}
          textColor={textColor}
        />
        {!isActive && (
          <View style={styles.blockContainer}>
            <Spacer height={12} />
            <InfoBlock
              icon={<Icon color={Color.textYellow1} i24 name="warning" />}
              style={styles.fullWidth}
              warning
              i18n={I18N.stakingInfoInactive}
            />
          </View>
        )}
        <Spacer height={isActive ? 20 : 12} />
        <Inline gap={12} style={styles.withHorizontalPadding}>
          <InfoBlockAmount value={staked} titleI18N={I18N.homeStakingStaked} />
          <InfoBlockAmount
            value={reward}
            titleI18N={I18N.validatorInfoReward}
          />
        </Inline>
        <Spacer height={12} />
        <InfoBlockAmount
          isLarge
          values={undelegated}
          titleI18N={I18N.validatorInfoUndelegateInProcess}
          style={styles.withHorizontalPadding}
        />
        <Spacer height={12} />
        <View style={styles.infoBlock}>
          <Block name={I18N.stakingInfoVotingPower}>
            <Text t11>{cleanNumber(votingPower)}</Text>
          </Block>
          <Block name={I18N.stakingInfoCommission}>
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
          {website && (
            <Block name={I18N.stakingInfoWebsite}>
              <Text t11 color={Color.textGreen1} onPress={onPressWebsite}>
                {website}
              </Text>
            </Block>
          )}
        </View>
        <View style={styles.blockContainer}>
          <Block name={I18N.stakingInfoAddress}>
            <CopyButton value={operator_address} activeOpacity={0.7}>
              <Text t14 color={Color.textBase2}>
                {operator_address}
                <Spacer width={3} />
                <Icon name="copy" i16 color={Color.graphicGreen1} />
              </Text>
            </CopyButton>
          </Block>
        </View>
        {details && (
          <Block name={I18N.stakingInfoDetail}>
            <Markdown>{details}</Markdown>
          </Block>
        )}
        <Spacer height={20} />
      </ScrollView>
      <View
        style={StyleSheet.compose(styles.footer as StyleProp<ViewStyle>, {
          paddingBottom: insets.bottom + 20,
        })}>
        {(rewards?.length ?? 0) >= 1 / NUM_PRECISION && (
          <>
            <Button
              loading={withdrawDelegatorRewardProgress}
              variant={ButtonVariant.second}
              onPress={onWithdrawDelegatorReward}
              i18n={I18N.stakingInfoGetReward}
            />
            <Spacer height={18} />
          </>
        )}
        <Inline gap={10}>
          <Button
            variant={ButtonVariant.contained}
            i18n={I18N.stakingInfoDelegate}
            onPress={onDelegate}
          />
          {delegations?.length && (
            <Button
              variant={ButtonVariant.contained}
              i18n={I18N.stakingInfoUnDelegate}
              onPress={onUnDelegate}
            />
          )}
        </Inline>
      </View>
    </>
  );
};

const styles = createTheme({
  blockContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
  },
  fullWidth: {
    width: '100%',
  },
  contentContainer: {
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
  },
  infoBlock: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Color.bg8,
    alignSelf: 'stretch',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  withHorizontalPadding: {
    marginHorizontal: 20,
  },
  footer: {
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
  iconContainer: {
    padding: 9,
    backgroundColor: Color.bg8,
    borderRadius: 12,
  },
});
