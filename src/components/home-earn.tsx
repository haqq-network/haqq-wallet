import React, {useCallback, useMemo, useRef} from 'react';

import {RefreshControl, ScrollView, TouchableOpacity, View} from 'react-native';
import {RiveRef} from 'rive-react-native';

import {Color} from '@app/colors';
import {app} from '@app/contexts';
import {cleanNumber, createTheme} from '@app/helpers';
import {useThemeSelector} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Raffle} from '@app/types';
import {SHADOW_L} from '@app/variables/shadows';

import {
  Button,
  ButtonSize,
  ButtonVariant,
  First,
  Icon,
  IconsName,
  Spacer,
  Text,
  TextVariant,
} from './ui';
import {RaffleBlockList} from './ui/raffle-block-list';
import {RiveWrapper} from './ui/rive-wrapper';
import {Separator} from './ui/separator';

export enum RaffleStateEnum {
  initial,
  tiket,
  pending,
  reward,
}

export interface HomeEarnProps {
  rewardAmount: number;
  showStakingRewards?: boolean;
  showStakingGetRewardsButtons?: boolean;
  isRafflesLoading: boolean;
  raffleList: Raffle[];
  onPressGetRewards: () => void;
  onPressStaking: () => void;
  loadRaffles: () => void;
  onPressGetTicket: (raffle: Raffle) => Promise<void>;
  onPressShowResult: (raffle: Raffle) => void;
  onPressRaffle: (raffle: Raffle) => void;
}

export const HomeEarn = ({
  rewardAmount = 0,
  showStakingGetRewardsButtons,
  showStakingRewards,
  raffleList,
  isRafflesLoading,
  onPressGetRewards,
  loadRaffles,
  onPressGetTicket,
  onPressShowResult,
  onPressStaking,
  onPressRaffle,
}: HomeEarnProps) => {
  const formattedRewardAmount = useMemo(
    () => cleanNumber(rewardAmount),
    [rewardAmount],
  );

  const stakingAnimationRef = useRef<RiveRef>(null);
  const stakingAnimationName = useThemeSelector({
    light: 'staking_on_earn_page_light',
    dark: 'staking_on_earn_page_dark',
  });

  const handlePressGetRewards = useCallback(() => {
    onPressGetRewards?.();
    stakingAnimationRef?.current?.reset?.();
    stakingAnimationRef?.current?.play?.();
  }, [onPressGetRewards]);

  const resultsCount = useMemo(
    () =>
      raffleList?.filter?.(it => it.close_at && Date.now() > it.close_at * 1000)
        ?.length || 0,
    [raffleList],
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRafflesLoading} onRefresh={loadRaffles} />
      }>
      <TouchableOpacity onPress={onPressStaking}>
        <View style={styles.stakingCard}>
          <View style={styles.row}>
            <View style={styles.earnStakingAnimation}>
              <RiveWrapper
                width={62}
                height={62}
                ref={stakingAnimationRef}
                resourceName={stakingAnimationName}
                autoplay={false}
              />
            </View>
            <View style={styles.stakingCardText}>
              <Text variant={TextVariant.t8} i18n={I18N.earnStaking} />
              <Text
                variant={TextVariant.t14}
                color={Color.textBase2}
                i18n={I18N.earnStakingDescription}
              />
            </View>
          </View>

          {showStakingRewards && (
            <>
              <Spacer height={16} />
              <Separator />
              <Spacer height={12} />

              <View style={styles.row}>
                <Text variant={TextVariant.t14} i18n={I18N.earnRewards} />
                <Spacer width={5} />
                <Text variant={TextVariant.t13} color={Color.textGreen1}>
                  {`${formattedRewardAmount} ${app.provider.denom}`}
                </Text>
                <Spacer flex={1} />
                {showStakingGetRewardsButtons && (
                  <Button
                    size={ButtonSize.small}
                    variant={ButtonVariant.second}
                    i18n={I18N.earnGetRewards}
                    onPress={handlePressGetRewards}
                  />
                )}
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>

      <First>
        {!raffleList.length && (
          <View>
            <View style={styles.row}>
              <Icon name={IconsName.ticket} color={Color.graphicBase2} />
              <Spacer width={3} />
              <Text
                variant={TextVariant.t8}
                color={Color.textBase2}
                i18n={I18N.homeEarnEmptyRaffleTitle}
              />
            </View>
            <Text
              variant={TextVariant.t14}
              color={Color.textBase2}
              i18n={I18N.homeEarnEmptyRaffleDescription}
            />
          </View>
        )}
        <>
          <View style={styles.row}>
            <Icon i24 color={Color.graphicBase1} name={IconsName.ticket} />
            <Spacer width={2} />
            <Text variant={TextVariant.t8} i18n={I18N.earnRaffles} />
            <Spacer width={4} />
            {!!resultsCount && (
              <Text
                variant={TextVariant.t15}
                i18n={I18N.earnRafflesResultCount}
                color={Color.textYellow1}
                i18params={{count: `${resultsCount}`}}
              />
            )}
          </View>
          <Text
            variant={TextVariant.t14}
            color={Color.textBase2}
            i18n={I18N.earnRafflesDescription}
          />

          <Spacer height={6} />

          <RaffleBlockList
            data={raffleList}
            scrollEnabled={false}
            onPress={onPressRaffle}
            onPressGetTicket={onPressGetTicket}
            onPressShowResult={onPressShowResult}
          />
        </>
      </First>
    </ScrollView>
  );
};

const styles = createTheme({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stakingCardText: {
    marginLeft: 10,
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stakingCard: {
    borderRadius: 12,
    marginBottom: 20,
    borderColor: Color.graphicSecond1,
    borderWidth: 1,
    padding: 16,
    ...SHADOW_L,
  },
  earnStakingAnimation: {
    width: 62,
    height: 62,
  },
});
