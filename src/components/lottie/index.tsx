import React, {useEffect, useRef} from 'react';

import {FOR_DETOX} from '@env';
import type AnimatedLottieView from 'lottie-react-native';
import Lottie, {LottieViewProps} from 'lottie-react-native';
import {AppState, StyleProp, ViewStyle} from 'react-native';

export type LottieWrapRef = {
  play: () => void;
  reset: () => void;
  pause: () => void;
  resume: () => void;
};

type AnimatedLottie = LottieViewProps & {
  source: string;
  autoPlay: boolean;
  loop: boolean;
  style?: StyleProp<ViewStyle>;
};

export const LottieWrap = React.forwardRef<LottieWrapRef, AnimatedLottie>(
  (props, ref) => {
    const lottieRef = useRef<AnimatedLottieView>(null);

    React.useImperativeHandle(ref, () => ({
      play: async () => lottieRef.current?.play?.(),
      reset: () => lottieRef?.current?.reset?.(),
      pause: () => lottieRef?.current?.pause?.(),
      resume: () => lottieRef?.current?.resume?.(),
    }));

    useEffect(() => {
      const listener = AppState.addEventListener('change', state => {
        if (FOR_DETOX) {
          return;
        }
        if (state === 'active') {
          lottieRef?.current?.resume();
        }
      });
      return () => {
        listener.remove();
      };
    }, []);

    return (
      <Lottie
        {...props}
        autoPlay={props?.autoPlay ?? !FOR_DETOX ?? false}
        ref={lottieRef}
        renderMode={'HARDWARE'}
        cacheComposition
      />
    );
  },
);
