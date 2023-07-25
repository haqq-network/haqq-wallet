import React from 'react';

import {format} from 'date-fns';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {useTimer} from '@app/hooks/use-timer';
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
  const {
    isFinish,
    secondsFormatted,
    minutesFormatted,
    hoursFormatted,
    daysFormatted,
    progress,
    endDate,
  } = useTimer({
    start,
    end,
    updateInterval,
  });

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
                    {daysFormatted}
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
                    {hoursFormatted}
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
                    {minutesFormatted}
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
                    {secondsFormatted}
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
