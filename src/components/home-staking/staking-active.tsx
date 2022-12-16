import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import type AnimatedLottieView from 'lottie-react-native';
import Lottie from 'lottie-react-native';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {InfoBlockAmount, Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {cleanNumber} from '@app/utils';
import {IS_IOS} from '@app/variables';

interface StakingActiveProps {
  availableSum: number;
  rewardSum: number;
  stakedSum: number;
  unDelegationSum: number;
}

export interface StakingActiveInterface {
  getReward: () => void;
}

export const StakingActive = forwardRef(
  (
    {availableSum, rewardSum, stakedSum, unDelegationSum}: StakingActiveProps,
    ref,
  ) => {
    const [isReceiveAnimation, setIsReceiveAnimation] = useState(false);
    const lottieRef = useRef<AnimatedLottieView>(null);
    const isEndRef = useRef<Boolean>(false);

    const animationFile = useMemo(() => {
      switch (true) {
        case isReceiveAnimation:
          return require('../../../assets/animations/get-reward-light.json');
        case stakedSum > 100:
          return require('../../../assets/animations/stake-light-100.json');
        case stakedSum > 20:
          return require('../../../assets/animations/stake-light-20-100.json');
        default:
          return require('../../../assets/animations/stake-light-0-20.json');
      }
    }, [stakedSum, isReceiveAnimation]);

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
        <Text t14 center color={Color.textBase2} i18n={I18N.homeStakingEmpty} />
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
        <Text t8 center i18n={I18N.homeStakingRewards} />
        <Text t3 center color={Color.textGreen1}>
          {cleanNumber(rewardSum.toFixed(4))} ISLM
        </Text>
        <Spacer height={28} />
        <InfoBlockAmount
          isLarge
          amountColor={Color.textGreen1}
          value={stakedSum}
          titleI18N={I18N.homeStakingStaked}
        />
        <Spacer height={12} />
        <View style={styles.blockContainer}>
          <InfoBlockAmount
            toFixed={0}
            value={availableSum}
            titleI18N={I18N.sumBlockAvailable}
          />
          <Spacer width={12} />
          <InfoBlockAmount
            value={unDelegationSum}
            titleI18N={I18N.homeStakingUnbounded}
          />
        </View>
        <Spacer height={20} />
      </View>
    );
  },
);

const styles = createTheme({
  circleIconContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  blockContainer: {
    flexDirection: 'row',
  },
});
