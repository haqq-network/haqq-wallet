import React, {useEffect, useMemo, useRef, useState} from 'react';

import {
  differenceInDays,
  differenceInHours,
  differenceInMilliseconds,
  differenceInMinutes,
  differenceInSeconds,
  format,
} from 'date-fns';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {TimerUpdateInterval} from '@app/types';

import {CircularProgress} from './circular-progress';
import {First} from './first';
import {Spacer} from './spacer';
import {Text} from './text';

type ProgressTitleProp =
  | {progressTitle: string; progressTitleI18N?: undefined}
  | {progressTitle?: undefined; progressTitleI18N: I18N};

type finishTitleProp =
  | {finishTitle: string; finishTitleI18N?: undefined}
  | {finishTitle?: undefined; finishTitleI18N: I18N};

export type TimerProps = {
  start: string | number | Date;
  end: string | number | Date;
  showDays?: boolean;
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;
  updateInterval?: TimerUpdateInterval;
} & ProgressTitleProp &
  finishTitleProp;

export const Timer = ({
  start,
  end,
  finishTitle,
  finishTitleI18N,
  progressTitle,
  progressTitleI18N,
  showDays = true,
  showHours = true,
  showMinutes = true,
  showSeconds = true,
  updateInterval = TimerUpdateInterval.second,
}: TimerProps) => {
  const intervalId = useRef<NodeJS.Timer>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const startDate = useMemo(() => new Date(start), [start]);
  const endDate = useMemo(() => new Date(end), [end]);
  const daysRemaining = useMemo(
    () => String(differenceInDays(endDate, currentDate)).padStart(2, '0'),
    [currentDate, endDate],
  );
  const hoursRemaining = useMemo(
    () => String(differenceInHours(endDate, currentDate) % 24).padStart(2, '0'),
    [currentDate, endDate],
  );
  const minutesRemaining = useMemo(
    () =>
      String(differenceInMinutes(endDate, currentDate) % 60).padStart(2, '0'),
    [currentDate, endDate],
  );
  const secondsRemaining = useMemo(
    () =>
      String(differenceInSeconds(endDate, currentDate) % 60).padStart(2, '0'),
    [currentDate, endDate],
  );
  const timeDifference = useMemo(
    () => differenceInMilliseconds(endDate, currentDate),
    [currentDate, endDate],
  );
  const totalTimeDifference = useMemo(
    () => differenceInMilliseconds(endDate, startDate),
    [endDate, startDate],
  );
  const progress = useMemo(
    () => timeDifference / totalTimeDifference,
    [timeDifference, totalTimeDifference],
  );

  const isFinish = useMemo(
    () => progress <= 0 || endDate <= currentDate,
    [currentDate, endDate, progress],
  );

  useEffect(() => {
    intervalId.current = setInterval(() => {
      if (isFinish) {
        return clearInterval(intervalId.current);
      }
      setCurrentDate(new Date());
    }, updateInterval);

    return () => clearInterval(intervalId.current);
  }, [isFinish, updateInterval]);

  return (
    <CircularProgress size={220} inverted progress={isFinish ? 0 : progress}>
      <First>
        {isFinish && (
          <>
            {/* @ts-ignore */}
            <Text t11 i18n={finishTitleI18N}>
              {finishTitle}
            </Text>
          </>
        )}
        <>
          {/* @ts-ignore */}
          <Text t11 i18n={progressTitleI18N}>
            {progressTitle}
          </Text>
          <View style={styles.row}>
            {showDays && (
              <>
                <Spacer width={5} />
                <View style={styles.timerValueContainer}>
                  <Text center t3 style={styles.timerValue}>
                    {daysRemaining}
                  </Text>
                  <Text
                    center
                    t15
                    color={Color.textBase2}
                    i18n={I18N.timerDay}
                  />
                </View>
                <Spacer width={5} />
              </>
            )}
            {showHours && (
              <>
                <Spacer width={5} />
                <View style={styles.timerValueContainer}>
                  <Text center t3 style={styles.timerValue}>
                    {hoursRemaining}
                  </Text>
                  <Text
                    center
                    t15
                    color={Color.textBase2}
                    i18n={I18N.timerHour}
                  />
                </View>
                <Spacer width={5} />
              </>
            )}
            {showMinutes && (
              <>
                <Spacer width={5} />
                <View style={styles.timerValueContainer}>
                  <Text center t3 style={styles.timerValue}>
                    {minutesRemaining}
                  </Text>
                  <Text
                    center
                    t15
                    color={Color.textBase2}
                    i18n={I18N.timerMin}
                  />
                </View>
                <Spacer width={5} />
              </>
            )}
            {showSeconds && (
              <>
                <Spacer width={5} />
                <View style={styles.timerValueContainer}>
                  <Text center t3 style={styles.timerValue}>
                    {secondsRemaining}
                  </Text>
                  <Text
                    center
                    t15
                    color={Color.textBase2}
                    i18n={I18N.timerSec}
                  />
                </View>
              </>
            )}
          </View>
        </>
      </First>
      <Spacer height={4} />
      <Text t14 color={Color.textBase2}>
        {format(endDate, 'dd.MM.yyyy')}
      </Text>
    </CircularProgress>
  );
};

const styles = createTheme({
  timerValue: {
    transform: [{translateY: 5}],
    width: 37,
  },
  timerValueContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    width: 37,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
