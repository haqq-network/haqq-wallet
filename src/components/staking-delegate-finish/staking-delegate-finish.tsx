import React from 'react';

import {View} from 'react-native';

import {Color, getColor} from '@app/colors';
import {
  Button,
  ButtonVariant,
  ISLMIcon,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {NetworkFee} from '@app/components/ui/network-fee';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {ValidatorItem} from '@app/types';
import {cleanNumber} from '@app/utils';

export type StakingDelegateFinishProps = {
  validator: ValidatorItem;
  amount: number;
  fee: number;
  txhash: string;
  onDone: () => void;
};

export const StakingDelegateFinish = ({
  onDone,
  validator,
  amount,
  fee,
}: StakingDelegateFinishProps) => {
  return (
    <PopupContainer style={styles.container}>
      <View style={styles.sub}>
        <LottieWrap
          source={require('../../../assets/animations/transaction-finish.json')}
          style={styles.image}
          autoPlay
          loop={false}
        />
      </View>
      <Text
        t4
        center
        i18n={I18N.stakingDelegateFinishTitle}
        style={styles.title}
        color={Color.textGreen1}
      />
      <ISLMIcon color={getColor(Color.graphicGreen1)} style={styles.icon} />
      <Text
        t11
        center
        i18n={I18N.stakingDelegateFinishTotalAmount}
        color={Color.textBase2}
        style={styles.totalAmount}
      />
      <Text t3 center style={styles.sum}>
        - {cleanNumber(amount)} ISLM
      </Text>
      <Text t13 center style={styles.address}>
        {validator.description.moniker}
      </Text>
      <NetworkFee fee={fee} />
      <Spacer minHeight={28} />
      <Button
        style={styles.margin}
        variant={ButtonVariant.contained}
        i18n={I18N.stakingDelegateFinishDone}
        onPress={onDone}
      />
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
  },
  sub: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  image: {width: 140, height: 140},
  title: {
    marginTop: 32,
    marginBottom: 34,
  },
  icon: {marginBottom: 16, alignSelf: 'center'},
  totalAmount: {
    marginBottom: 4,
  },
  sum: {
    marginBottom: 8,
  },
  address: {
    marginBottom: 4,
  },
  margin: {marginBottom: 16},
});
