import React, {useCallback, useMemo, useState} from 'react';

import {observer} from 'mobx-react';
import {ActivityIndicator, Image, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {Color, getColor} from '@app/colors';
import {cleanNumber, createTheme, getWindowWidth} from '@app/helpers';
import {useThemeSelector} from '@app/hooks';
import {useTimer} from '@app/hooks/use-timer';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Raffle, TimerUpdateInterval} from '@app/types';
import {WEI} from '@app/variables/common';

import {Button, ButtonSize, ButtonVariant} from './button';
import {First} from './first';
import {Icon, IconsName} from './icon';
import {Text, TextVariant} from './text';

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

const checkIsSmallWidth = () => getWindowWidth() < 400;

export const RaffleBlock = observer(
  ({
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

    const [showTicketAnimation, setShowTicketAnimation] = useState(false);
    const [ticketAnimationFinish, setTicketAnimationFinish] = useState(false);
    const [loadingSuccess, setLoadingSuccess] = useState(false);

    const ticketAnimation = useThemeSelector({
      light: require('@assets/animations/earn-ticket-light.json'),
      dark: require('@assets/animations/earn-ticket-dark.json'),
    });

    const {timerString} = useTimer({
      end: Date.now() + item.locked_duration * 1000,
      updateInterval: TimerUpdateInterval.minute,
    });

    const state = useMemo(() => {
      if (item.status === 'closed' || Date.now() > item.close_at * 1000) {
        return 'result';
      }

      if (item.locked_duration > 0) {
        return 'timer';
      }

      if (showTicketAnimation || Date.now() > item.locked_until) {
        return 'getTicket';
      }
    }, [
      item.close_at,
      item.locked_duration,
      item.locked_until,
      item.status,
      showTicketAnimation,
    ]);

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
        setLoadingSuccess(true);
      } catch (e) {
        setLoadingSuccess(false);
      } finally {
        setTicketAnimationFinish(false);
        setShowTicketAnimation(false);
      }
    }, [item, onPressGetTicket]);

    const onTicketAnimationFinish = useCallback(() => {
      setTicketAnimationFinish(true);
    }, []);

    return (
      <TouchableOpacity onPress={handlePress}>
        <LinearGradient colors={colors} style={styles.gradientBlock}>
          <View style={styles.wrapper}>
            <View style={styles.textBlock}>
              <View style={[styles.row, styles.flexOne]}>
                <Text
                  variant={TextVariant.t10}
                  numberOfLines={1}
                  color={Color.textBase3}>
                  {item.title}
                </Text>
                <Icon
                  style={styles.forwardIcon}
                  color={Color.textBase3}
                  name={IconsName.arrow_forward_small}
                />
              </View>
              <View style={styles.row}>
                <Text
                  variant={TextVariant.t14}
                  numberOfLines={1}
                  color={Color.textBase3}
                  i18n={I18N.rafflePrizePool}
                />
                <Image
                  style={styles.islmIcon}
                  source={require('@assets/images/islm_icon.png')}
                />
                <Text
                  variant={TextVariant.t13}
                  numberOfLines={1}
                  style={styles.flexOne}
                  color={Color.textBase3}
                  ellipsizeMode={'tail'}>
                  {`${formattedAmount} ${Provider.selectedProvider.denom}`}
                </Text>
              </View>
            </View>
            {buttonType === RaffleBlocButtonType.ticket && (
              <View style={styles.buttonWrapper}>
                {state === 'result' && (
                  <Button
                    style={styles.resultButton}
                    size={ButtonSize.small}
                    variant={ButtonVariant.warning}
                    i18n={I18N.earnShowResult}
                    onPress={handleShowResultPress}
                  />
                )}
                {state === 'timer' && (
                  <Button
                    disabled
                    style={styles.timerButton}
                    size={ButtonSize.small}
                    variant={ButtonVariant.second}
                    title={timerString}
                  />
                )}
                {state === 'getTicket' &&
                  !showTicketAnimation &&
                  !loadingSuccess && (
                    <Button
                      style={styles.ticketButton}
                      size={ButtonSize.small}
                      variant={ButtonVariant.second}
                      i18n={I18N.earnGetTicket}
                      onPress={handleGetTicketPress}
                    />
                  )}

                {state === 'getTicket' &&
                  (showTicketAnimation || loadingSuccess) && (
                    <Button
                      style={styles.ticketButton}
                      size={ButtonSize.small}
                      variant={ButtonVariant.second}>
                      <First>
                        {(ticketAnimationFinish || loadingSuccess) && (
                          <ActivityIndicator
                            size={'small'}
                            color={getColor(Color.graphicGreen1)}
                          />
                        )}
                        <LottieWrap
                          style={styles.ticket}
                          progress={0}
                          source={ticketAnimation}
                          onAnimationFinish={onTicketAnimationFinish}
                          autoPlay={true}
                          loop={false}
                        />
                      </First>
                    </Button>
                  )}
              </View>
            )}
            {buttonType === RaffleBlocButtonType.custom && rightAction}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  },
);

const styles = createTheme({
  ticket: {height: 34, width: 34},
  forwardIcon: {
    transform: [{translateX: -10}],
  },
  textBlock: {
    flex: 1,
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
    paddingHorizontal: () => (checkIsSmallWidth() ? 8 : 16),
    paddingVertical: 12,
    marginVertical: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketButton: {
    marginLeft: 8,
    minWidth: 95,
  },
  timerButton: {
    minWidth: 85,
    marginLeft: 8,
  },
  resultButton: {
    width: 131,
    marginLeft: () => (checkIsSmallWidth() ? 4 : 8),
  },
  wrapper: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonWrapper: {
    flex: 0,
    alignItems: 'flex-end',
  },
});
