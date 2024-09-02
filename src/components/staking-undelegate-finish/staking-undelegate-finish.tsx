import React from 'react';

import {observer} from 'mobx-react';
import {Image, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  Icon,
  IconButton,
  Inline,
  LottieWrap,
  NetworkFee,
  PopupContainer,
  Spacer,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {createTheme, openURL} from '@app/helpers';
import {cleanNumber} from '@app/helpers/clean-number';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Balance} from '@app/services/balance';
import {ValidatorItem} from '@app/types';

export type StakingDelegateFinishProps = {
  validator: ValidatorItem;
  amount: number;
  fee: Balance;
  txhash: string;
  onDone: () => void;
};

export const StakingUnDelegateFinish = observer(
  ({onDone, validator, amount, fee, txhash}: StakingDelegateFinishProps) => {
    const onPressHash = async () => {
      const url = `https://haqq.explorers.guru/transaction/${txhash}`;
      await openURL(url);
    };

    return (
      <PopupContainer
        testID="staking-undelegate-finish"
        style={styles.container}>
        <View style={styles.sub}>
          <LottieWrap
            source={require('@assets/animations/transaction-finish.json')}
            style={styles.image}
            autoPlay
            loop={false}
          />
        </View>
        <Text
          variant={TextVariant.t4}
          position={TextPosition.center}
          i18n={I18N.stakingUnDelegateFinishTitle}
          style={styles.title}
          color={Color.textGreen1}
        />
        <Image
          source={require('@assets/images/islm_icon.png')}
          style={styles.icon}
        />
        <Text
          variant={TextVariant.t11}
          position={TextPosition.center}
          i18n={I18N.stakingUnDelegateFinishTotalAmount}
          color={Color.textBase2}
          style={styles.totalAmount}
        />
        <Text
          variant={TextVariant.t3}
          position={TextPosition.center}
          style={styles.sum}>
          - {`${cleanNumber(amount)} ${Provider.selectedProvider.denom}`}
        </Text>
        <Text
          variant={TextVariant.t13}
          position={TextPosition.center}
          style={styles.address}>
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
              variant={TextVariant.t15}
              position={TextPosition.center}
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
  },
);

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
  icon: {
    marginBottom: 16,
    alignSelf: 'center',
    width: 64,
    height: 64,
  },
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
