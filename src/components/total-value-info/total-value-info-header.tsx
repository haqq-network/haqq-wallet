import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {First, Spacer, Text, TextVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {BalanceModel, Wallet} from '@app/models/wallet';

import {StackedVestedTokens} from '../stacked-vested-tokens';

export type TotalValueInfoProps = {
  balance: BalanceModel;
  onPressInfo: () => void;
};

export const TotalValueInfoHeader = ({
  balance,
  onPressInfo,
}: TotalValueInfoProps) => {
  return (
    <>
      <View style={styles.header}>
        <Text
          variant={TextVariant.t12}
          i18n={I18N.totalValueAccount}
          color={Color.textBase2}
        />
        <Spacer height={4} />
        <View style={styles.balanceWrapper}>
          <Text variant={TextVariant.t3}>
            {balance.total.toBalanceString('auto')}
          </Text>
        </View>
        {!!balance.total.toFiat() && (
          <View style={styles.usdWrapper}>
            <Text style={styles.usdText} variant={TextVariant.t13}>
              {balance.total.toFiat()}
            </Text>
          </View>
        )}
      </View>
      <First>
        <StackedVestedTokens
          availableBalance={balance?.available}
          lockedBalance={balance?.locked}
          vestedBalance={balance?.vested}
          stakingBalance={balance?.staked}
          onPressInfo={onPressInfo}
          unlock={balance?.nextVestingUnlockDate}
          isBalanceLoading={Wallet.isBalancesLoading}
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
    paddingHorizontal: 20,
  },
  balanceWrapper: {
    alignSelf: 'flex-start',
  },
});
