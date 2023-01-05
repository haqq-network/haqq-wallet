import React from 'react';

import {View} from 'react-native';

import {Color, getColor} from '@app/colors';
import {
  Button,
  ButtonVariant,
  ISLMIcon,
  Icon,
  IconButton,
  Inline,
  LottieWrap,
  NetworkFee,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme, openURL} from '@app/helpers';
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

export const StakingUnDelegateFinish = ({
  onDone,
  validator,
  amount,
  fee,
  txhash,
}: StakingDelegateFinishProps) => {
  const onPressHash = async () => {
    const url = `https://haqq.explorers.guru/transaction/${txhash}`;
    await openURL(url);
  };

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
        i18n={I18N.stakingUnDelegateFinishTitle}
        style={styles.title}
        color={Color.textGreen1}
      />
      <ISLMIcon color={getColor(Color.graphicGreen1)} style={styles.icon} />
      <Text
        t11
        center
        i18n={I18N.stakingUnDelegateFinishTotalAmount}
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
      <Spacer />
      <Inline gap={12}>
        <IconButton onPress={onPressHash} style={styles.button}>
          <Icon
            name="block"
            color={Color.graphicBase2}
            style={styles.buttonIcon}
            i22
          />
          <Text
            t15
            center
            i18n={I18N.transactionFinishHash}
            color={Color.textBase2}
          />
        </IconButton>
      </Inline>
      <Spacer height={28} />
      <Button
        style={styles.margin}
        variant={ButtonVariant.contained}
        i18n={I18N.stakingUnDelegateFinishDone}
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
  button: {
    marginHorizontal: 6,
    paddingHorizontal: 4,
    paddingVertical: 12,
    backgroundColor: Color.bg8,
    borderRadius: 12,
  },
  buttonIcon: {
    marginBottom: 4,
  },
});
