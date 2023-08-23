import React, {useMemo} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {First, Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {I18N} from '@app/i18n';
import {Balance} from '@app/services/balance';

import {StackedVestedTokens} from '../stacked-vested-tokens';

export type TotalValueInfoProps = {
  balance: Balance;
  unvestedBalance: Balance | undefined;
  lockedBalance: Balance | undefined;
  vestedBalance: Balance | undefined;
  stakingBalance: Balance | undefined;
  onPressInfo: () => void;
};

export const TotalValueInfoHeader = ({
  unvestedBalance,
  vestedBalance,
  stakingBalance,
  balance,
  lockedBalance,
  onPressInfo,
}: TotalValueInfoProps) => {
  const totalBalance = useMemo(
    () => balance?.operate(stakingBalance, 'add'),
    [balance, stakingBalance],
  );

  return (
    <View>
      <View style={styles.header}>
        <Text t12 i18n={I18N.totalValueAccount} color={Color.textBase2} />
        <Spacer height={4} />
        <Text
          t3
          i18n={I18N.amountISLM}
          i18params={{amount: totalBalance?.toFloatString()}}
        />
      </View>
      <First>
        {isFeatureEnabled(Feature.lockedStakedVestedTokens) && (
          <StackedVestedTokens
            balance={balance}
            unvestedBalance={unvestedBalance}
            lockedBalance={lockedBalance}
            vestedBalance={vestedBalance}
            stakingBalance={stakingBalance}
            onPressInfo={onPressInfo}
          />
        )}
      </First>
    </View>
  );
};

const styles = createTheme({
  header: {
    marginHorizontal: 20,
  },
});
