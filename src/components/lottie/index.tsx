import React, {useEffect, useRef} from 'react';

import {useAppState} from '@react-native-community/hooks';
import type AnimatedLottieView from 'lottie-react-native';
import Lottie, {LottieViewProps} from 'lottie-react-native';
import {StyleProp, ViewStyle} from 'react-native';

import {AppStore} from '@app/models/app';

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
      play: async () => {
        if (AppStore.isDetoxRunning) {
          return;
        }
        lottieRef.current?.play?.();
      },
      reset: () => {
        if (AppStore.isDetoxRunning) {
          return;
        }
        lottieRef?.current?.reset?.();
      },
      pause: () => {
        if (AppStore.isDetoxRunning) {
          return;
        }
        lottieRef?.current?.pause?.();
      },
      resume: () => {
        if (AppStore.isDetoxRunning) {
          return;
        }
        lottieRef?.current?.resume?.();
      },
    }));

    useEffect(() => {
      if (AppStore.isDetoxRunning) {
        return;
      }
      if (appState === 'active') {
        lottieRef?.current?.resume();
      }
    }, [appState]);

    return (
      <Lottie
        {...props}
        autoPlay={AppStore.isDetoxRunning ? false : props?.autoPlay}
        ref={lottieRef}
        cacheComposition
      />
    );
  },
);
