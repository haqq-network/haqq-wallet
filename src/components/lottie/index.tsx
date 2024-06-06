import React, {useEffect, useRef} from 'react';

import {useAppState} from '@react-native-community/hooks';
import type AnimatedLottieView from 'lottie-react-native';
import Lottie, {LottieViewProps} from 'lottie-react-native';
import {StyleProp, ViewStyle} from 'react-native';
import Config from 'react-native-config';

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
    const appState = useAppState();

    React.useImperativeHandle(ref, () => ({
      play: async () => lottieRef.current?.play?.(),
      reset: () => lottieRef?.current?.reset?.(),
      pause: () => lottieRef?.current?.pause?.(),
      resume: () => lottieRef?.current?.resume?.(),
    }));

    useEffect(() => {
      if (Config.FOR_DETOX) {
        return;
      }
      if (appState === 'active') {
        lottieRef?.current?.resume();
      }
    }, [appState]);

    return (
      <Lottie
        {...props}
        autoPlay={props?.autoPlay ?? !Config.FOR_DETOX ?? false}
        ref={lottieRef}
        cacheComposition
      />
    );
  },
);
