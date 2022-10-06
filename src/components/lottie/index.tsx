import React, {useEffect, useRef} from 'react';
import {AppState} from 'react-native';
import Lottie from 'lottie-react-native';
import type AnimatedLottieView from 'lottie-react-native';
import type AnimatedLottieViewProps from 'lottie-react-native';

interface AnimatedLottie extends AnimatedLottieViewProps {
  source: string;
  autoPlay: boolean;
  loop: boolean;
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
