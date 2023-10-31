import {useEffect, useLayoutEffect} from 'react';

export const useEffectAsync = (
  effect: () => Promise<any> | void,
  inputs: any[],
) => {
  useEffect(() => {
    effect();
  }, inputs);
};

export const useLayoutEffectAsync = (
  effect: () => Promise<any> | void,
  inputs: any[],
) => {
  useLayoutEffect(() => {
    effect();
  }, inputs);
};
