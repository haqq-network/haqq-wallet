import React from 'react';

import {View} from 'react-native';

import {First, Spacer, Text} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {Color, createTheme} from '@app/theme';
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
    <>
      <View style={styles.header}>
        <Text t12 i18n={I18N.totalValueAccount} color={Color.textBase2} />
        <Spacer height={4} />
        <Text t3 children={balance.total.toBalanceString()} />
        <View style={styles.usdWrapper}>
          <Text style={styles.usdText} t13 children={balance.total.toFiat()} />
        </View>
      </View>
      <First>
        <StackedVestedTokens
          availableBalance={balance?.available}
          lockedBalance={balance?.locked}
          vestedBalance={balance?.vested}
          stakingBalance={balance?.staked}
          onPressInfo={onPressInfo}
          unlock={balance?.unlock}
        />
      </First>
    </>
  );
};

const styles = createTheme({
  usdText: {
    alignSelf: 'flex-start',
  },
  usdWrapper: {
    backgroundColor: Color.graphicSecond1,
    alignSelf: 'flex-start',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  header: {
    marginHorizontal: 20,
  },
});
