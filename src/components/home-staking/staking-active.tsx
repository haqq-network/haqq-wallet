import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {Icon, Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

export const StakingActive = () => {
  return (
    <>
      <Spacer height={23} />
      <Text t14 center color={Color.textBase2} i18n={I18N.homeStakingEmpty} />
      <Spacer height={36} />
      <View style={styles.circleIconContainer}>
        <Icon color={Color.graphicSecond2} i32 name="logo" />
      </View>
      <Spacer height={20} />
      <Text t8 center i18n={I18N.rewards} />
      <Text t3 center color={Color.textGreen1}>
        {(32).toFixed(2)} ISLM
      </Text>
      <Spacer height={28} />
      <View style={styles.blockContainer}>
        <View style={styles.infoBlock}>
          <Text t15 center color={Color.textBase2} i18n={I18N.staked} />
          <Spacer height={2} />
          <Text t13 center color={Color.textGreen1}>
            {(32).toFixed(2)} ISLM
          </Text>
        </View>
      </View>
      <Spacer height={12} />
      <View style={styles.blockContainer}>
        <View style={styles.infoBlock}>
          <Text t15 center color={Color.textBase2} i18n={I18N.staked} />
          <Spacer height={2} />
          <Text t13 center color={Color.textGreen1}>
            {(32).toFixed(2)} ISLM
          </Text>
        </View>
        <Spacer width={12} />
        <View style={styles.infoBlock}>
          <Text t15 center color={Color.textBase2} i18n={I18N.staked} />
          <Spacer height={2} />
          <Text t13 center color={Color.textGreen1}>
            {(32).toFixed(2)} ISLM
          </Text>
        </View>
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
  infoBlock: {
    borderWidth: 1,
    borderColor: Color.graphicSecond1,
    borderRadius: 12,
    flex: 1,
    padding: 12,
  },
  blockContainer: {
    flexDirection: 'row',
  },
});
