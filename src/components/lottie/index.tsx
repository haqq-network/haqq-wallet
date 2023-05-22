import React, {useEffect, useRef} from 'react';

import type AnimatedLottieView from 'lottie-react-native';
import Lottie, {AnimatedLottieViewProps} from 'lottie-react-native';
import {AppState, StyleProp, ViewStyle} from 'react-native';

export type LottieWrapRef = {
  play: () => void;
  reset: () => void;
  pause: () => void;
  resume: () => void;
};

type AnimatedLottie = AnimatedLottieViewProps & {
  source: string;
  autoPlay: boolean;
  loop: boolean;
  style?: StyleProp<ViewStyle>;
};

export const LottieWrap = React.forwardRef<LottieWrapRef, AnimatedLottie>(
  (props, ref) => {
    const lottieRef = useRef<AnimatedLottieView>(null);

    React.useImperativeHandle(ref, () => ({
      play: () => lottieRef?.current?.play?.(),
      reset: () => lottieRef?.current?.reset?.(),
      pause: () => lottieRef?.current?.pause?.(),
      resume: () => lottieRef?.current?.resume?.(),
    }));

    useEffect(() => {
      AppState.addEventListener('change', state => {
        if (state === 'active') {
          lottieRef?.current?.resume();
        }
      });
    });

    return <Lottie {...props} ref={lottieRef} />;
  },
);
