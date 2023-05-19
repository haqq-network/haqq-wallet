import {useEffect, useRef, useState} from 'react';

import {TimerUpdateInterval} from '@app/types';

export const useReactiveDate = (updateInterval: TimerUpdateInterval) => {
  const [now, setNow] = useState(new Date());
  const intervalId = useRef<NodeJS.Timeout>();

  useEffect(() => {
    intervalId.current = setInterval(() => {
      setNow(new Date());
    }, updateInterval);

    return () => clearInterval(intervalId.current);
  }, [updateInterval]);

  return now;
};
