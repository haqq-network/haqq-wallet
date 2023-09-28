import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {First, Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {I18N} from '@app/i18n';
import {BalanceData} from '@app/types';

import {StackedVestedTokens} from '../stacked-vested-tokens';

export type TotalValueInfoProps = {
  balance: BalanceData;
  onPressInfo: () => void;
};

export const TotalValueInfoHeader = ({
  balance,
  onPressInfo,
}: TotalValueInfoProps) => {
  return (
    <View>
      <View style={styles.header}>
        <Text t12 i18n={I18N.totalValueAccount} color={Color.textBase2} />
        <Spacer height={4} />
        <Text t3 children={balance.total.toBalanceString()} />
      </View>
      <First>
        {isFeatureEnabled(Feature.lockedStakedVestedTokens) && (
          <StackedVestedTokens
            availableBalance={balance.available}
            lockedBalance={balance.locked}
            vestedBalance={balance.vested}
            stakingBalance={balance.staked}
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
