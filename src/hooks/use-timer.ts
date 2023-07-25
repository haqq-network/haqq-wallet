import {useEffect, useMemo, useRef, useState} from 'react';

import {TimerUpdateInterval} from '@app/types';
import {calculateEstimateTime, calculateEstimateTimeString} from '@app/utils';

export interface UseTimerParams {
  start?: string | number | Date;
  end: string | number | Date;
  updateInterval: TimerUpdateInterval;
}

export const useTimer = ({
  start = Date.now(),
  end,
  updateInterval,
}: UseTimerParams) => {
  const intervalId = useRef<NodeJS.Timer>();
  const isLastIntervalUpdate = useRef(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFinish, setFinish] = useState(false);
  const startDate = useMemo(() => new Date(start), [start]);
  const endDate = useMemo(() => new Date(end), [end]);
  const timerString = useMemo(
    () => calculateEstimateTimeString({endDate, currentDate, startDate}),
    [currentDate, endDate, startDate],
  );

  useEffect(() => {
    intervalId.current = setInterval(() => {
      if (isLastIntervalUpdate.current) {
        setFinish(true);
        clearInterval(intervalId.current);
      }

      const now = new Date();
      if (now >= endDate) {
        isLastIntervalUpdate.current = true;
      }

      setCurrentDate(now);
    }, updateInterval);

    return () => clearInterval(intervalId.current);
  }, [endDate, updateInterval]);

  const estimateTime = useMemo(
    () => calculateEstimateTime({currentDate, startDate, endDate}),
    [currentDate, startDate, endDate],
  );

  return {
    isFinish,
    endDate,
    startDate,
    timerString,
    ...estimateTime,
  };
};
