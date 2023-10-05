import {useEffect, useLayoutEffect} from 'react';

export const useEffectAsync = (
  effect: () => Promise<any> | void,
  inputs: any[],
) => {
  useEffect(() => {
    effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, inputs);
};

export const useLayoutEffectAsync = (
  effect: () => Promise<any> | void,
  inputs: any[],
) => {
  useLayoutEffect(() => {
    effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, inputs);
};
