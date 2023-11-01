import React, {useEffect, useRef, useState} from 'react';

import type AnimatedLottieView from 'lottie-react-native';
import Lottie, {AnimatedLottieViewProps} from 'lottie-react-native';
import {AppState, StyleProp, ViewStyle} from 'react-native';

import {useLayoutEffectAsync} from '@app/hooks/use-effect-async';
import {sleep} from '@app/utils';

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
    const [trigger, triggerAnimation] = useState({});

    React.useImperativeHandle(ref, () => ({
      play: async () => {
        //FIXME: https://github.com/lottie-react-native/lottie-react-native/issues/1092
        await sleep(50);
        triggerAnimation({});
      },
      reset: () => lottieRef?.current?.reset?.(),
      pause: () => lottieRef?.current?.pause?.(),
      resume: () => lottieRef?.current?.resume?.(),
    }));

    useEffect(() => {
      const listener = AppState.addEventListener('change', state => {
        if (state === 'active') {
          lottieRef?.current?.resume();
        }
      });
      return () => {
        listener.remove();
      };
    }, []);

    useLayoutEffectAsync(async () => {
      await sleep(50);
      lottieRef.current?.play();
    }, [trigger]);

    return (
      <Lottie
        {...props}
        ref={lottieRef}
        renderMode="HARDWARE"
        useNativeLooping
        cacheComposition
      />
    );
  },
);
