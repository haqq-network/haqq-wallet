import React, {useEffect, useRef} from 'react';

import {FOR_DETOX} from '@env';
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

    useLayoutEffectAsync(async () => {
      if (FOR_DETOX) {
        return;
      }
      // FIXME: Please upgrade lottie-react-native after new release
      // https://github.com/lottie-react-native/lottie-react-native/issues/1092
      await sleep(333);
      if (props.autoPlay) {
        lottieRef.current?.play();
      }
    }, [props.autoPlay]);

    return (
      <Lottie
        {...props}
        autoPlay={false}
        ref={lottieRef}
        renderMode={'HARDWARE'}
        cacheComposition
      />
    );
  },
);
