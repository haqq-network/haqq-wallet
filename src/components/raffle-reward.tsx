import React from 'react';

import {Image, SafeAreaView, StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {useThemeSelector} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Raffle} from '@app/types';

import {LottieWrap} from './lottie';
import {Button, ButtonVariant, Icon, IconsName, Spacer, Text} from './ui';

export interface RaffleRewardProps {
  item: Raffle;
  onPressUnderstood: () => void;
}

export const RaffleReward = ({item, onPressUnderstood}: RaffleRewardProps) => {
  const animation = useThemeSelector({
    light: require('@assets/animations/raffle-reward-light.json'),
    dark: require('@assets/animations/raffle-reward-dark.json'),
  });

  return (
    <SafeAreaView style={styles.container}>
      <Spacer flex={1} />
      <View style={styles.animation}>
        <LottieWrap source={animation} autoPlay loop={false} />
      </View>
      <Spacer height={80} />
      <Text i18n={I18N.raffleRewardСongratulations} t4 />
      <Spacer height={13} />
      <View style={styles.row}>
        <Icon name={IconsName.ticket} color={Color.textYellow1} />
        <Spacer width={4} />
        <Text
          t12
          i18n={I18N.raffleRewardWonTickets}
          i18params={{
            winner_tickets: `${item.winner_tickets}`,
            total_tickets: `${item.total_tickets}`,
          }}
          color={Color.textYellow1}
        />
      </View>
      <Spacer height={10} />
      <View style={styles.row}>
        <Image
          style={styles.islmIcon}
          source={require('@assets/images/islm_icon.png')}
        />
        <Text
          t10
          color={Color.textGreen1}
          numberOfLines={1}
          i18n={I18N.raffleRewardPrize}
          // TODO:
          i18params={{islm: '3'}}
        />
      </View>
      <Spacer flex={1} />
      <Button
        style={styles.button}
        variant={ButtonVariant.contained}
        i18n={I18N.raffleRewardUnderstood}
        onPress={onPressUnderstood}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  animation: {
    width: 280,
    height: 280,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  button: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  islmIcon: {
    width: 18,
    height: 18,
    marginLeft: 6,
    marginRight: 4,
  },
});
