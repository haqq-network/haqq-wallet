import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  Icon,
  Spacer,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Balance} from '@app/services/balance';

interface StakingEmptyProps {
  availableSum: Balance;
}

export const StakingEmpty = ({availableSum}: StakingEmptyProps) => {
  return (
    <>
      <Spacer />
      <View>
        <Text
          variant={TextVariant.t14}
          position={TextPosition.center}
          color={Color.textBase2}
          i18n={I18N.homeStakingEmpty}
          i18params={{symbol: app.provider.denom}}
        />
        <Spacer height={36} />
        <View style={styles.circleIconContainer}>
          <Icon color={Color.graphicSecond2} i32 name="logo" />
        </View>
        <Spacer height={20} />
        <Text
          variant={TextVariant.t8}
          position={TextPosition.center}
          i18n={I18N.sumBlockAvailable}
        />
        <Text
          testID="staking-availableSum"
          variant={TextVariant.t3}
          position={TextPosition.center}
          color={Color.textGreen1}>
          {availableSum.toBalanceString()}
        </Text>
      </View>
      <Spacer />
    </>
  );
};

const styles = createTheme({
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
