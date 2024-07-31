import React, {useCallback, useMemo, useState} from 'react';

import {observer} from 'mobx-react';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Text,
  TextVariant,
} from '@app/components/ui';
import {ShadowCard} from '@app/components/ui/shadow-card';
import {WidgetHeader} from '@app/components/ui/widget-header';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {getRemoteBalanceValue} from '@app/helpers/get-remote-balance-value';
import {I18N, getText} from '@app/i18n';
import {Balance} from '@app/services/balance';

type Props = {
  onPress: () => void;
  onGetReward: () => Promise<void>;
  rewardAmount: Balance;
};

export const StakingWidget = observer(
  ({onPress, onGetReward, rewardAmount}: Props) => {
    const [loading, setLoading] = useState(false);
    const canGetRewards = useMemo(
      () =>
        rewardAmount.compare(
          getRemoteBalanceValue('staking_reward_min_amount'),
          'gte',
        ),
      [rewardAmount],
    );

    const onPressGetReward = useCallback(async () => {
      try {
        if (canGetRewards) {
          setLoading(true);
          await onGetReward();
        }
      } finally {
        setLoading(false);
      }
    }, [canGetRewards, onGetReward]);

    return (
      <ShadowCard
        testID="staking-widget"
        onPress={onPress}
        style={styles.wrapper}>
        <WidgetHeader
          icon={'staking_thin'}
          title={getText(I18N.earnStaking)}
          description={getText(I18N.earnStakingDescription, {
            symbol: app.provider.denom,
          })}
          largeIcon
        />
        <View style={styles.rewardsWrapper}>
          <View style={styles.row}>
            <Text variant={TextVariant.t14}>{`${getText(
              I18N.earnRewards,
            )} `}</Text>
            <Text variant={TextVariant.t13} color={Color.textGreen1}>
              {rewardAmount.toBalanceString()}
            </Text>
          </View>
          <Button
            i18n={I18N.stakingHomeGetRewards}
            variant={ButtonVariant.second}
            size={ButtonSize.small}
            disabled={!canGetRewards}
            loading={loading}
            circleBorders
            onPress={onPressGetReward}
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
