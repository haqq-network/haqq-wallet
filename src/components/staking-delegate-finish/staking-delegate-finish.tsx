import React from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  ISLMIcon,
  Icon,
  IconButton,
  Inline,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {NetworkFee} from '@app/components/ui/network-fee';
import {openURL} from '@app/helpers';
import {useThematicStyles, useTheme} from '@app/hooks';
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
  txhash,
}: StakingDelegateFinishProps) => {
  const onPressHash = async () => {
    const url = `https://haqq.explorers.guru/transaction/${txhash}`;
    await openURL(url);
  };

  const styles = useThematicStyles(stylesObj);
  const {colors} = useTheme();

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
      <ISLMIcon color={colors.graphicGreen1} style={styles.icon} />
      <Text
        t11
        center
        i18n={I18N.stakingDelegateFinishTotalAmount}
        color={Color.textBase2}
        style={styles.totalAmount}
      />
      <Text t3 center style={styles.sum}>
        - {cleanNumber(amount.toFixed(2))} ISLM
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
        i18n={I18N.stakingDelegateFinishDone}
        onPress={onDone}
      />
    </PopupContainer>
  );
};

const stylesObj = StyleSheet.create({
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
