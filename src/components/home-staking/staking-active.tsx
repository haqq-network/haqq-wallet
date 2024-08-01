import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import type AnimatedLottieView from 'lottie-react-native';
import Lottie from 'lottie-react-native';
import {observer} from 'mobx-react';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  InfoBlockAmount,
  Inline,
  Spacer,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {useTheme} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Balance} from '@app/services/balance';
import {AppTheme} from '@app/types';
import {IS_IOS} from '@app/variables/common';

interface StakingActiveProps {
  availableSum: Balance;
  rewardSum: Balance;
  stakedSum: Balance;
  unDelegationSum: Balance;
}

export interface StakingActiveInterface {
  getReward: () => void;
}

export const StakingActive = observer(
  forwardRef(
    (
      {availableSum, rewardSum, stakedSum, unDelegationSum}: StakingActiveProps,
      ref,
    ) => {
      const theme = useTheme();
      const [isReceiveAnimation, setIsReceiveAnimation] = useState(false);
      const lottieRef = useRef<AnimatedLottieView>(null);
      const isEndRef = useRef<Boolean>(false);

      const animationFile = useMemo(() => {
        switch (true) {
          case isReceiveAnimation:
            if (theme === AppTheme.dark) {
              return require('@assets/animations/get-reward-dark.json');
            }
            return require('@assets/animations/get-reward-light.json');
          case stakedSum.toNumber() > 100:
            if (theme === AppTheme.dark) {
              return require('@assets/animations/stake-dark-100.json');
            }

            return require('@assets/animations/stake-light-100.json');
          case stakedSum.toNumber() > 20:
            if (theme === AppTheme.dark) {
              return require('@assets/animations/stake-dark-20-100.json');
            }

            return require('@assets/animations/stake-light-20-100.json');
          default:
            if (theme === AppTheme.dark) {
              return require('@assets/animations/stake-dark-0-20.json');
            }

            return require('@assets/animations/stake-light-0-20.json');
        }
      }, [isReceiveAnimation, theme, stakedSum]);

      useImperativeHandle(ref, () => ({
        getReward() {
          isEndRef.current = false;
          setIsReceiveAnimation(true);
        },
      }));

      const onAnimationFinish = (isCancelled: boolean) => {
        if (!isCancelled) {
          lottieRef.current?.play();
          if (isReceiveAnimation) {
            if (IS_IOS) {
              setIsReceiveAnimation(false);
            } else {
              setTimeout(() => setIsReceiveAnimation(false), 2000);
            }
          }
        }
      };

      return (
        <View>
          <Spacer height={23} />
          <Text
            variant={TextVariant.t14}
            position={TextPosition.center}
            color={Color.textBase2}
            i18n={I18N.homeStakingEmpty}
            i18params={{symbol: app.provider.denom}}
          />
          <Spacer height={36} />
          <Lottie
            source={animationFile}
            autoPlay
            onAnimationFinish={onAnimationFinish}
            loop={false}
            ref={lottieRef}
            style={styles.circleIconContainer}
          />
          <Spacer height={20} />
          <Text
            variant={TextVariant.t8}
            position={TextPosition.center}
            i18n={I18N.homeStakingRewards}
          />
          <Text
            testID="staking-rewardSum"
            variant={TextVariant.t3}
            position={TextPosition.center}
            color={Color.textGreen1}>
            {rewardSum.toBalanceString()}
          </Text>
          <Spacer height={28} />
          <InfoBlockAmount
            isLarge
            amountColor={Color.textGreen1}
            value={stakedSum.toFloat()}
            titleI18N={I18N.homeStakingStaked}
          />
          <Spacer height={12} />
          <Inline gap={12}>
            <InfoBlockAmount
              value={availableSum.toFloat()}
              titleI18N={I18N.sumBlockAvailable}
            />
            <InfoBlockAmount
              value={unDelegationSum.toFloat()}
              titleI18N={I18N.homeStakingUnbounded}
            />
          </Inline>
          <Spacer height={20} />
        </View>
      );
    },
  ),
);

const styles = createTheme({
  circleIconContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
