import React, {useCallback, useMemo, useState} from 'react';

import {Image, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {Color} from '@app/colors';
import {cleanNumber, createTheme} from '@app/helpers';
import {useThemeSelector} from '@app/hooks';
import {useReactiveDate} from '@app/hooks/use-reactive-date';
import {I18N} from '@app/i18n';
import {Raffle, TimerUpdateInterval} from '@app/types';
import {calculateEstimateTime} from '@app/utils';
import {WEI} from '@app/variables/common';

import {Button, ButtonSize, ButtonVariant} from './button';
import {Icon, IconsName} from './icon';
import {Spacer} from './spacer';
import {Text} from './text';

import {LottieWrap} from '../lottie';

export enum RaffleBlockGradientVariant {
  green,
  blue,
}

export enum RaffleBlocButtonType {
  ticket,
  custom,
}

type ButtonType =
  | {
      buttonType: RaffleBlocButtonType.ticket;
      onPressGetTicket: (raffle: Raffle) => Promise<void>;
      onPressShowResult: (raffle: Raffle) => void;
      rightAction?: never;
    }
  | {
      buttonType: RaffleBlocButtonType.custom;
      rightAction: React.ReactNode;
      onPressGetTicket?: never;
      onPressShowResult?: never;
    };

export type RaffleBlockProps = {
  item: Raffle;
  gradient: RaffleBlockGradientVariant;
  onPress: (raffle: Raffle) => void;
} & ButtonType;

const GRADIENT_COLORS_MAP = {
  [RaffleBlockGradientVariant.green]: ['#08D296', '#09B29E'],
  [RaffleBlockGradientVariant.blue]: ['#08A2D2', '#0993BE'],
};

export const RaffleBlock = ({
  gradient,
  item,
  buttonType,
  rightAction,
  onPressGetTicket,
  onPressShowResult,
  onPress,
}: RaffleBlockProps) => {
  const colors = useMemo(() => GRADIENT_COLORS_MAP[gradient], [gradient]);
  const formattedAmount = useMemo(
    () => cleanNumber(parseInt(item.budget, 16) / WEI),
    [item],
  );
  const subtitle = useMemo(
    () => (item.total_tickets > 1 ? I18N.rafflePrizePool : I18N.rafflePrize),
    [item.total_tickets],
  );
  const [showTicketAnimation, setShowTicketAnimation] = useState(false);
  const ticketAnimation = useThemeSelector({
    light: require('@assets/animations/earn-ticket-light.json'),
    dark: require('@assets/animations/earn-ticket-dark.json'),
  });
  const now = useReactiveDate(TimerUpdateInterval.minute);
  const estimateTime = useMemo(
    () => calculateEstimateTime(now, new Date(item.locked_until * 1000)),
    [item, now],
  );

  const state = useMemo(() => {
    if (item.status === 'closed' || Date.now() > item.close_at * 1000) {
      return 'result';
    }

    if (Date.now() < item.locked_until * 1000) {
      return 'timer';
    }

    if (showTicketAnimation || Date.now() > item.locked_until) {
      return 'getTicket';
    }
  }, [item.close_at, item.locked_until, item.status, showTicketAnimation]);

  const handlePress = useCallback(() => {
    onPress?.(item);
  }, [item, onPress]);

  const handleShowResultPress = useCallback(() => {
    onPressShowResult?.(item);
  }, [item, onPressShowResult]);

  const handleGetTicketPress = useCallback(async () => {
    try {
      setShowTicketAnimation(true);
      await onPressGetTicket?.(item);
    } finally {
      setShowTicketAnimation(false);
    }
  }, [item, onPressGetTicket]);

  return (
    <TouchableOpacity onPress={handlePress}>
      <LinearGradient colors={colors} style={styles.gradientBlock}>
        <View style={[styles.row, styles.flexOne]}>
          <View style={styles.textBlock}>
            <View style={[styles.row, styles.flexOne]}>
              <Text
                t10
                numberOfLines={1}
                color={Color.textBase3}
                children={item.title}
              />
              <Icon
                style={styles.forwardIcon}
                color={Color.textBase3}
                name={IconsName.arrow_forward_small}
              />
            </View>
            <View style={styles.row}>
              <Text
                t14
                numberOfLines={1}
                color={Color.textBase3}
                i18n={subtitle}
              />
              <Image
                style={styles.islmIcon}
                source={require('@assets/images/islm_icon.png')}
              />
              <Text
                t13
                numberOfLines={1}
                style={styles.flexOne}
                color={Color.textBase3}>
                {formattedAmount} ISLM
              </Text>
            </View>
          </View>
          <Spacer flex={1} />
          <View>
            {buttonType === RaffleBlocButtonType.ticket && (
              <>
                {state === 'result' && (
                  <Button
                    size={ButtonSize.small}
                    variant={ButtonVariant.warning}
                    i18n={I18N.earnShowResult}
                    onPress={handleShowResultPress}
                  />
                )}
                {state === 'timer' && (
                  <Button
                    disabled
                    size={ButtonSize.small}
                    variant={ButtonVariant.second}
                    title={estimateTime}
                  />
                )}
                {state === 'getTicket' && !showTicketAnimation && (
                  <Button
                    size={ButtonSize.small}
                    variant={ButtonVariant.second}
                    i18n={I18N.earnGetTicket}
                    onPress={handleGetTicketPress}
                  />
                )}

                {state === 'getTicket' && showTicketAnimation && (
                  <Button
                    style={styles.tiketButton}
                    size={ButtonSize.small}
                    variant={ButtonVariant.second}>
                    <LottieWrap
                      progress={0}
                      source={ticketAnimation}
                      autoPlay={true}
                      loop={false}
                    />
                  </Button>
                )}
              </>
            )}
            {buttonType === RaffleBlocButtonType.custom && rightAction}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = createTheme({
  forwardIcon: {
    transform: [{translateX: -10}],
  },
  textBlock: {
    width: '60%',
  },
  flexOne: {
    flex: 1,
  },
  islmIcon: {
    width: 18,
    height: 18,
    marginLeft: 6,
    marginRight: 4,
  },
  gradientBlock: {
    width: '100%',
    minHeight: 68,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tiketButton: {
    width: 95,
  },
});
