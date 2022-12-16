import {useRef} from 'react';

import {throttle} from '@app/utils';

export function useThrottle<T extends Array<any>>(
  func: (...args: T) => void,
  delay: number,
) {
  const cb = useRef(throttle(func, delay));

  return cb.current;
}
