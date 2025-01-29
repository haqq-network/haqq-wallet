import {useCallback, useEffect} from 'react';

import {LayoutAnimation, UIManager} from 'react-native';

import {AppStore} from '@app/models/app';

export const useLayoutAnimation = () => {
  useEffect(() => {
    if (
      !UIManager.setLayoutAnimationEnabledExperimental ||
      AppStore.isDetoxRunning
    ) {
      return;
    }

    UIManager.setLayoutAnimationEnabledExperimental(true);

    return () => {
      if (!UIManager.setLayoutAnimationEnabledExperimental) {
        return;
      }

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
