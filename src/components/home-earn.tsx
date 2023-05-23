import React, {useCallback, useMemo, useRef} from 'react';

import {ScrollView, TouchableOpacity, View} from 'react-native';
import Rive, {RiveRef} from 'rive-react-native';

import {Color} from '@app/colors';
import {cleanNumber, createTheme} from '@app/helpers';
import {useThemeSelector} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Raffle} from '@app/types';
import {SHADOW_COLOR_1} from '@app/variables/common';

import {
  Button,
  ButtonSize,
  ButtonVariant,
  Icon,
  IconsName,
  Spacer,
  Text,
} from './ui';
import {RaffleBlockList} from './ui/raffle-block-list';
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
  raffleList: Raffle[];
  onPressGetRewards: () => void;
  onPressStaking: () => void;
  onPressGetTicket: (raffle: Raffle) => void;
  onPressShowResult: (raffle: Raffle) => void;
  onPressRaffle: (raffle: Raffle) => void;
}

export const HomeEarn = ({
  rewardAmount = 0,
  showStakingGetRewardsButtons,
  showStakingRewards,
  raffleList,
  onPressGetRewards,
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

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={onPressStaking}>
        <View style={styles.stakingCard}>
          <View style={styles.row}>
            <View style={styles.earnStakingAnimation}>
              <Rive
                ref={stakingAnimationRef}
                resourceName={stakingAnimationName}
                autoplay={false}
              />
            </View>
            <View style={styles.stakingCardText}>
              <Text t8 i18n={I18N.earnStaking} />
              <Text
                t14
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
                <Text t14 i18n={I18N.earnRewards} />
                <Spacer width={5} />
                <Text t13 color={Color.textGreen1}>
                  {formattedRewardAmount} ISLM
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

      <View>
        <View style={styles.row}>
          <Icon i24 color={Color.graphicBase1} name={IconsName.ticket} />
          <Spacer width={2} />
          <Text t8 i18n={I18N.earnRaffles} />
          <Spacer width={4} />
          {/* TODO: add conition */}
          {true && (
            <Text
              t15
              i18n={I18N.earnRafflesResultCount}
              color={Color.textYellow1}
              i18params={{count: '1'}}
            />
          )}
        </View>
        <Text t14 color={Color.textBase2} i18n={I18N.earnRafflesDescription} />

        <Spacer height={12} />

        <RaffleBlockList
          data={raffleList}
          scrollEnabled={false}
          onPress={onPressRaffle}
          onPressGetTicket={onPressGetTicket}
          onPressShowResult={onPressShowResult}
        />
      </View>
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
    marginHorizontal: 20,
  },
  stakingCard: {
    borderRadius: 12,
    backgroundColor: Color.bg1,
    marginBottom: 20,
    borderColor: Color.graphicSecond1,
    borderWidth: 1,
    shadowColor: SHADOW_COLOR_1,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 8,
    shadowOpacity: 1,
    elevation: 13,
    padding: 16,
  },
  earnStakingAnimation: {
    width: 62,
    height: 62,
  },
});
