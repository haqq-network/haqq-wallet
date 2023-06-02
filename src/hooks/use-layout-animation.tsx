import {useEffect, useRef} from 'react';

import {LayoutAnimation, UIManager} from 'react-native';

import {IS_ANDROID} from '@app/variables/common';

export const useLayoutAnimation = () => {
  useEffect(() => {
    if (!UIManager.setLayoutAnimationEnabledExperimental) {
      return;
    }

    if (IS_ANDROID) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    return () => {
      if (IS_ANDROID) {
        UIManager.setLayoutAnimationEnabledExperimental(false);
      }
    };
  }, []);

  const animate = useRef(LayoutAnimation.easeInEaseOut).current;

  return {
    animate,
  };
};
