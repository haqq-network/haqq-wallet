import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Balance} from '@app/types';

import {DashedLine} from './dashed-line';
import {Icon, IconButton, IconsName, Spacer, Text} from './ui';

export interface StackedVestedTokensProps {
  unvestedBalance: Balance | undefined;
  lockedBalance: Balance | undefined;
  vestedBalance: Balance | undefined;
  stakingBalance: Balance | undefined;
  balance: Balance | undefined;
  onPressInfo(): void;
}

export function StackedVestedTokens({
  balance,
  stakingBalance,
  onPressInfo,
}: StackedVestedTokensProps) {
  return (
    <View style={styles.container}>
      <View>
        <View style={styles.row}>
          <Icon i20 color={Color.graphicBase1} name={IconsName.coin} />
          <Spacer width={4} />
          <Text
            t10
            color={Color.textBase1}
            i18n={I18N.lockedTokensAvailable}
            i18params={{count: balance?.toFloatString() ?? '0'}}
          />
        </View>
        {stakingBalance?.isPositive() && (
          <>
            <DashedLine
              style={styles.separator}
              width={2}
              color={Color.graphicSecond2}
            />
            <View style={styles.row}>
              <Icon i20 color={Color.graphicBase1} name={IconsName.lock} />
              <Spacer width={4} />
              <Text
                t10
                color={Color.textBase1}
                i18n={I18N.lockedTokensLocked}
                i18params={{count: stakingBalance.toFloatString()}}
              />
              <Spacer width={4} />
              <IconButton onPress={onPressInfo}>
                <Icon i20 color={Color.graphicBase2} name={IconsName.info} />
              </IconButton>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = createTheme({
  container: {
    marginHorizontal: 20,
    paddingVertical: 12,
    marginVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Color.graphicSecond1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    marginVertical: 8,
  },
});
