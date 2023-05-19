import React, {useMemo} from 'react';

import {Image, SafeAreaView, View} from 'react-native';

import {Color} from '@app/colors';
import {cleanNumber, createTheme} from '@app/helpers';
import {useReactiveDate} from '@app/hooks/use-reactive-date';
import {I18N} from '@app/i18n';
import {Raffle, TimerUpdateInterval} from '@app/types';
import {calculateEstimateTime} from '@app/utils';

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
  const formattedBudget = useMemo(
    () => cleanNumber(item.budget),
    [item.budget],
  );
  const now = useReactiveDate(TimerUpdateInterval.minute);
  const estimateTime = useMemo(
    () => calculateEstimateTime(now, item.locked_until),
    [item, now],
  );
  const showGetTiket = useMemo(() => Date.now() > item.locked_until, [item]);
  const showTimer = useMemo(() => Date.now() < item.locked_until, [item]);
  const showResult = useMemo(() => Date.now() > item.close_at, [item]);

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

      <Text
        t14
        center
        color={Color.textBase2}
        i18params={{islm: `${formattedBudget}`}}
        i18n={I18N.raffleDetailsPrizeByTicketDescription}
      />

      <Spacer height={48} />

      <Timer
        finishTitleI18N={I18N.raffleDetailsTimerFinishTitle}
        progressTitleI18N={I18N.raffleDetailsTimerProgressTitle}
        start={item.start_at}
        end={item.close_at}
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
          i18n={I18N.raffleDetailsHaveTickets}
          // TODO:
          i18params={{tickets: '7'}}
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
        {showGetTiket && (
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
