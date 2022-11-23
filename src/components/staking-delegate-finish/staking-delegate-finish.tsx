import React from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  ISLMIcon,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {TxResponse} from '@app/services/cosmos';
import {ValidatorItem} from '@app/types';
import {
  LIGHT_BG_8,
  LIGHT_GRAPHIC_GREEN_1,
  LIGHT_TEXT_BASE_1,
  LIGHT_TEXT_BASE_2,
  LIGHT_TEXT_GREEN_1,
  WEI,
} from '@app/variables';

export type StakingDelegateFinishProps = {
  validator: ValidatorItem;
  transaction: TxResponse;
  onDone: () => void;
};

export const StakingDelegateFinish = ({
  onDone,
  validator,
  transaction,
}: StakingDelegateFinishProps) => {
  return (
    <PopupContainer style={styles.container}>
      <View style={styles.sub}>
        <LottieWrap
          source={require('../../assets/animations/transaction-finish.json')}
          style={styles.image}
          autoPlay
          loop={false}
        />
      </View>
      <Text t4 i18n={I18N.stakingDelegateFinishTitle} style={styles.title} />
      <ISLMIcon color={LIGHT_GRAPHIC_GREEN_1} style={page.icon} />
      {transaction && (
        <Text clean style={page.sum}>
          - {(transaction?.value + transaction?.fee).toFixed(8)} ISLM
        </Text>
      )}
      <Text t13 center style={styles.address}>
        {validator.description.moniker}
      </Text>
      <Text t15 center color={Color.textBase2}>
        Network Fee: {(5000 / WEI).toFixed(15)} ISLM
      </Text>
      <Spacer />
      <Button
        style={styles.margin}
        variant={ButtonVariant.contained}
        title={getText(I18N.stakingDelegateFinishDone)}
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
    color: LIGHT_TEXT_GREEN_1,
    textAlign: 'center',
  },
  icon: {marginBottom: 16, alignSelf: 'center'},
  sum: {
    marginBottom: 8,
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 30,
    textAlign: 'center',
    color: LIGHT_TEXT_BASE_1,
  },
  address: {
    marginBottom: 4,
  },
  fee: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    color: LIGHT_TEXT_BASE_2,
  },
  buttons: {
    flexDirection: 'row',
    marginHorizontal: -6,
    marginBottom: 28,
  },
  button: {
    flex: 1,
    marginHorizontal: 6,
    paddingHorizontal: 4,
    paddingVertical: 12,
    backgroundColor: LIGHT_BG_8,
    borderRadius: 12,
  },
  buttonIcon: {
    marginBottom: 4,
  },
  buttonText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    color: LIGHT_TEXT_BASE_2,
  },
  margin: {marginBottom: 16},
});
