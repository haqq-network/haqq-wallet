import React, {useMemo} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {Button, ButtonVariant, Icon, Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useWallets} from '@app/hooks';
import {I18N} from '@app/i18n';

export type StakingHomeProps = {
  onPressValidators: () => void;
};

export const HomeStaking = ({onPressValidators}: StakingHomeProps) => {
  const wallets = useWallets();

  const availableSum = useMemo(() => {
    return wallets.getWallets().reduce((acc, w) => acc + w.balance, 0);
  }, [wallets]);

  return (
    <View style={styles.container}>
      <Spacer />
      <Text t14 center color={Color.textBase2} i18n={I18N.homeStakingEmpty} />
      <Spacer height={36} />
      <View style={styles.circleIconContainer}>
        <Icon color={Color.graphicSecond2} i32 name="logo" />
      </View>
      <Spacer height={20} />
      <Text t8 center i18n={I18N.sumBlockAvailable} />
      <Text t3 center color={Color.textGreen1} style={styles.sum}>
        {availableSum.toFixed(2)} ISLM
      </Text>
      <Spacer />
      <Button
        i18n={I18N.stakingHomeButton}
        variant={ButtonVariant.contained}
        onPress={onPressValidators}
        style={styles.margin}
      />
    </View>
  );
};

const styles = createTheme({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sum: {
    flex: 1,
  },
  margin: {
    marginBottom: 20,
  },
  circleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Color.bg3,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
