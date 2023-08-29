import React, {memo, useMemo} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {Button, ButtonSize, ButtonVariant, Text} from '@app/components/ui';
import {ShadowCard} from '@app/components/ui/shadow-card';
import {WidgetHeader} from '@app/components/ui/widget-header';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {Balance} from '@app/services/balance';
import {NUM_PRECISION} from '@app/variables/common';

type Props = {
  onPress: () => void;
  onGetReward: () => void;
  rewardAmount: Balance;
};

export const StakingWidget = memo(
  ({onPress, onGetReward, rewardAmount}: Props) => {
    const canGetRewards = useMemo(
      () => rewardAmount.toNumber() >= 1 / NUM_PRECISION,
      [rewardAmount],
    );

    return (
      <ShadowCard onPress={onPress} style={styles.wrapper}>
        <WidgetHeader
          icon={'staking_thin'}
          title={getText(I18N.earnStaking)}
          description={getText(I18N.earnStakingDescription)}
          largeIcon
        />
        <View style={styles.rewardsWrapper}>
          <View style={styles.row}>
            <Text t14>{`${getText(I18N.earnRewards)} `}</Text>
            <Text t13 color={Color.textGreen1}>
              {rewardAmount.toBalanceString()}
            </Text>
          </View>
          <Button
            i18n={I18N.stakingHomeGetRewards}
            variant={ButtonVariant.second}
            size={ButtonSize.small}
            disabled={!canGetRewards}
            circleBorders
            onPress={onGetReward}
          />
        </View>
      </ShadowCard>
    );
  },
);

const styles = createTheme({
  row: {flexDirection: 'row'},
  wrapper: {paddingHorizontal: 16},
  rewardsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopColor: Color.graphicSecond1,
    borderTopWidth: 1,
    marginTop: 16,
  },
});
