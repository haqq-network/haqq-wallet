import {NavigationContainerRef} from '@react-navigation/core/src/types';

export const awaitNavigatorIsReady = (
  navigator: NavigationContainerRef<any>,
) => {
  return new Promise<void>(resolve => {
    if (navigator.isReady()) {
      resolve();
      return;
    }

    const interval = setInterval(() => {
      if (navigator.isReady()) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
};
