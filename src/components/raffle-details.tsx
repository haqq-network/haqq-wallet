import React, {useMemo} from 'react';

import {Image, SafeAreaView, View} from 'react-native';

import {Color} from '@app/colors';
import {cleanNumber, createTheme} from '@app/helpers';
import {useReactiveDate} from '@app/hooks/use-reactive-date';
import {I18N} from '@app/i18n';
import {Raffle, TimerUpdateInterval} from '@app/types';
import {calculateEstimateTime} from '@app/utils';
import {WEI} from '@app/variables/common';

import {
  Button,
  ButtonVariant,
  First,
  Icon,
  IconsName,
  Spacer,
  Text,
} from './ui';
import {Separator} from './ui/separator';
import {Timer} from './ui/timer';

export interface RaffleDetailsProps {
  item: Raffle;
  onPressGetTicket: () => void;
  onPressShowResult: () => void;
}

export const RaffleDetails = ({
  item,
  onPressGetTicket,
  onPressShowResult,
}: RaffleDetailsProps) => {
  const closed_at = useMemo(
    () => new Date(item.close_at * 1000),
    [item.close_at],
  );
  const locked_until = useMemo(
    () => new Date(item.locked_until * 1000),
    [item.locked_until],
  );
  const formattedBudget = useMemo(
    () => cleanNumber(parseInt(item.budget, 16) / WEI),
    [item.budget],
  );
  const now = useReactiveDate(TimerUpdateInterval.minute);
  const estimateTime = useMemo(
    () => calculateEstimateTime(now, locked_until),
    [locked_until, now],
  );
  const showGetTicket = useMemo(
    () => new Date() > locked_until,
    [locked_until],
  );
  const showTimer = useMemo(() => new Date() < locked_until, [locked_until]);
  const showResult = useMemo(() => new Date() > closed_at, [closed_at]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.row}>
        <Text t8 numberOfLines={1} i18n={I18N.rafflePrize} />
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
          // TODO:
          i18params={{islm: '3', tickets: '5'}}
        />
      </View>
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

      <Spacer height={19} />

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
            title={estimateTime}
          />
        )}
        {showGetTicket && (
          <Button
            style={styles.buttonStyle}
            variant={ButtonVariant.contained}
            onPress={onPressGetTicket}
            i18n={I18N.earnGetTicket}
          />
        )}
      </First>
    </SafeAreaView>
  );
};

const styles = createTheme({
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
