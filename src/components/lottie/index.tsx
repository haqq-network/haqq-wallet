import React, {useEffect, useRef} from 'react';
import {AppState, ViewStyle} from 'react-native';
import Lottie from 'lottie-react-native';
import type AnimatedLottieView from 'lottie-react-native';

interface AnimatedLottie {
  source: string;
  autoPlay: boolean;
  loop: boolean;
  style: ViewStyle;
}
export const LottieWrap = (props: AnimatedLottie) => {
  const ref = useRef<AnimatedLottieView>(null);

  useEffect(() => {
    AppState.addEventListener('change', state => {
      if (state === 'active') {
        ref?.current?.resume();
      }
    });
  });

  return <Lottie {...props} ref={ref} />;
};
