import {useCallback, useEffect} from 'react';

import {LayoutAnimation, UIManager} from 'react-native';

import {IS_ANDROID} from '@app/variables/common';

export const useLayoutAnimation = () => {
  useEffect(() => {
    if (!UIManager.setLayoutAnimationEnabledExperimental || !IS_ANDROID) {
      return;
    }

    UIManager.setLayoutAnimationEnabledExperimental(true);

    return () => {
      UIManager.setLayoutAnimationEnabledExperimental(false);
    };
  }, []);

  const animate = useCallback(() => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        200,
        LayoutAnimation.Types.linear,
        LayoutAnimation.Properties.opacity,
      ),
    );
  }, []);

  return {
    animate,
  };
};
