import React from 'react';

import {observer} from 'mobx-react';
import {Image, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {NetworkFee} from '@app/components/ui/network-fee';
import {createTheme} from '@app/helpers';
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

export const StakingDelegateFinish = observer(
  ({onDone, validator, amount, fee}: StakingDelegateFinishProps) => {
    return (
      <PopupContainer
        testID={'staking-finish-container'}
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
          i18n={I18N.stakingDelegateFinishTitle}
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
          i18n={I18N.stakingDelegateFinishTotalAmount}
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
        <Spacer minHeight={28} />
        <Button
          style={styles.margin}
          variant={ButtonVariant.contained}
          i18n={I18N.stakingDelegateFinishDone}
          onPress={onDone}
          testID="staking-finish"
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
});
