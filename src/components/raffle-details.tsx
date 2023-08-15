import React, {useCallback, useMemo, useState} from 'react';

import {Image, View} from 'react-native';

import {Color} from '@app/colors';
import {cleanNumber, createTheme} from '@app/helpers';
import {useTimer} from '@app/hooks/use-timer';
import {I18N} from '@app/i18n';
import {Raffle, TimerUpdateInterval} from '@app/types';
import {WEI} from '@app/variables/common';

import {
  Button,
  ButtonVariant,
  First,
  Icon,
  IconsName,
  PopupContainer,
  Spacer,
  Text,
} from './ui';
import {Separator} from './ui/separator';
import {Timer} from './ui/timer';

export interface RaffleDetailsProps {
  item: Raffle;
  prevIslmCount: number;
  prevTicketsCount: number;
  onPressGetTicket: () => void;
  onPressShowResult: () => void;
}

export const RaffleDetails = ({
  item,
  prevIslmCount,
  prevTicketsCount,
  onPressGetTicket,
  onPressShowResult,
}: RaffleDetailsProps) => {
  const [loading, setLoading] = useState(false);
  const {timerString} = useTimer({
    end: Date.now() + item.locked_duration * 1000,
    updateInterval: TimerUpdateInterval.minute,
  });

  const closed_at = useMemo(
    () => new Date(item.close_at * 1000),
    [item.close_at],
  );
  const locked_until = useMemo(
    () => new Date(Math.min(item.locked_until, item.close_at) * 1000),
    [item.locked_until, item.close_at],
  );
  const formattedBudget = useMemo(
    () => cleanNumber(parseInt(item.budget, 16) / WEI),
    [item],
  );
  const showGetTicket = useMemo(
    () => new Date() > locked_until,
    [locked_until],
  );
  const showTimer = useMemo(
    () => item.locked_duration > 0,
    [item.locked_duration],
  );
  const showResult = useMemo(() => new Date() > closed_at, [closed_at]);

  const handlePressGetTicket = useCallback(async () => {
    try {
      setLoading(true);
      await onPressGetTicket();
    } finally {
      setLoading(false);
    }
  }, [onPressGetTicket]);

  return (
    <PopupContainer style={styles.container}>
      <View style={styles.row}>
        <Text t8 numberOfLines={1} i18n={I18N.rafflePrizePool} />
        <Image
          style={styles.islmIcon}
          source={require('@assets/images/islm_icon.png')}
        />
        <Text t8 numberOfLines={1}>
          {formattedBudget} ISLM
        </Text>
      </View>

      <Spacer height={12} />

      <Text t14 center color={Color.textBase2}>
        {item.description}
      </Text>

      <Spacer height={48} />

      <Timer
        finishTitleI18N={I18N.raffleDetailsTimerFinishTitle}
        progressTitleI18N={I18N.raffleDetailsTimerProgressTitle}
        start={item.start_at * 1000}
        end={item.close_at * 1000}
        showSeconds={false}
        updateInterval={TimerUpdateInterval.minute}
      />

      <Spacer height={48} />

      <Separator />
      <Spacer height={8} />
      {prevIslmCount > 0 && (
        <View style={styles.row}>
          <Text
            t14
            numberOfLines={1}
            i18n={I18N.raffleDetailsPreviousRaffle}
            color={Color.textBase2}
          />
          <Spacer width={4} />
          <Image
            style={styles.islmIcon}
            source={require('@assets/images/islm_icon.png')}
          />
          <Text
            t14
            numberOfLines={1}
            i18n={I18N.raffleDetailsPreviousRaffleDetails}
            i18params={{
              islm: cleanNumber(prevIslmCount),
              tickets: `${prevTicketsCount} `,
            }}
          />
        </View>
      )}
      <Spacer height={8} />
      <Separator />

      <Spacer flex={1} />

      <View style={styles.row}>
        <Icon name={IconsName.ticket} color={Color.textYellow1} />
        <Spacer width={4} />
        <Text
          t12
          i18n={
            item.total_tickets === 1
              ? I18N.raffleDetailsHaveTicket
              : I18N.raffleDetailsHaveTickets
          }
          i18params={{tickets: String(item.total_tickets)}}
          color={Color.textYellow1}
        />
      </View>

      <Spacer height={16} />

      <First>
        {showResult && (
          <Button
            style={styles.buttonStyle}
            variant={ButtonVariant.warning}
            i18n={I18N.earnShowResult}
            onPress={onPressShowResult}
          />
        )}
        {showTimer && (
          <Button
            disabled
            style={styles.buttonStyle}
            variant={ButtonVariant.contained}
            title={timerString}
          />
        )}
        {showGetTicket && (
          <Button
            loading={loading}
            style={styles.buttonStyle}
            variant={ButtonVariant.contained}
            onPress={handlePressGetTicket}
            i18n={I18N.earnGetTicket}
          />
        )}
      </First>
      <Spacer height={16} />
      <Text
        center
        t17
        color={Color.textBase2}
        i18n={I18N.earnHint}
        style={styles.hintStyle}
      />
      <Spacer height={20} />
    </PopupContainer>
  );
};

const styles = createTheme({
  hintStyle: {
    marginHorizontal: 40,
    fontSize: 9,
  },
  buttonStyle: {
    width: '100%',
  },
  container: {
    marginHorizontal: 20,
    alignItems: 'center',
    flex: 1,
  },

  islmIcon: {
    width: 18,
    height: 18,
    marginLeft: 6,
    marginRight: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
