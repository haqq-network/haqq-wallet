import {useEffect} from 'react';

export const useEffectAsync = (
  effect: () => Promise<any> | void,
  inputs: any[],
) => {
  useEffect(() => {
    effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, inputs);
};
