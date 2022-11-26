import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {Icon, Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

interface StakingEmptyProps {
  availableSum: number;
}

export const StakingEmpty = ({availableSum}: StakingEmptyProps) => {
  return (
    <>
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
    </>
  );
};

const styles = createTheme({
  sum: {
    flex: 1,
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
