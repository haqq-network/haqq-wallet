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
  InfoBlockType,
  Inline,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme, openURL} from '@app/helpers';
import {formatPercents} from '@app/helpers/format-percents';
import {I18N} from '@app/i18n';
import {StakingMetadata} from '@app/models/staking-metadata';
import {ValidatorItem, ValidatorStatus} from '@app/types';
import {cleanNumber} from '@app/utils';
import {WEI} from '@app/variables';

export type StakingInfoProps = {
  withdrawDelegatorRewardProgress: boolean;
  delegations: Realm.Results<StakingMetadata> | null;
  rewards: Realm.Results<StakingMetadata> | null;
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
        <View style={styles.iconContainer}>
          <Icon color={Color.graphicBase1} name="servers" i24 />
        </View>
        <Spacer height={16} />
        <Text t5 center style={styles.title}>
          {moniker}
        </Text>
        <Badge
          i18n={localStatus as number}
          labelColor={labelColor}
          textColor={textColor}
        />
        <Spacer height={20} />
        {!isActive && (
          <>
            <InfoBlock
              icon={<Icon color={Color.textYellow1} i24 name="warning" />}
              style={styles.withHorizontalPadding}
              type={InfoBlockType.warning}
              i18n={I18N.stakingInfoInactive}
            />
            <Spacer height={16} />
          </>
        )}
        <View style={styles.infoBlock}>
          <Block i18n={I18N.stakingInfoVotingPower}>
            <Text t14>{cleanNumber(votingPower.toFixed(2))}</Text>
          </Block>
          <Block i18n={I18N.stakingInfoCommission}>
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
            <Block i18n={I18N.stakingInfoWebsite}>
              <Text t14 color={Color.textGreen1} onPress={onPressWebsite}>
                {website}
              </Text>
            </Block>
          )}
        </View>
        <Block
          style={styles.withHorizontalPadding}
          i18n={I18N.stakingInfoAddress}>
          <CopyButton value={operator_address} activeOpacity={0.7}>
            <Text t14 color={Color.textBase2}>
              {operator_address}
              <Spacer width={3} />
              <Icon name="copy" i16 color={Color.graphicGreen1} />
            </Text>
          </CopyButton>
        </Block>
        {details && (
          <Block i18n={I18N.stakingInfoDetail}>
            <Markdown>{details}</Markdown>
          </Block>
        )}
        <Spacer height={20} />
      </ScrollView>
      <View
        style={StyleSheet.compose(styles.footer as StyleProp<ViewStyle>, {
          paddingBottom: insets.bottom + 20,
        })}>
        {(rewards?.length ?? 0) > 0 && (
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
