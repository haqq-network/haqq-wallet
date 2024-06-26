import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  First,
  Icon,
  IconsName,
  Spacer,
  Text,
  TextVariant,
} from '@app/components/ui';
import {Placeholder} from '@app/components/ui/placeholder';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Balance} from '@app/services/balance';

type BalanceInfoDetailsProps = {
  isBalancesFirstSync: boolean;
  total?: Balance;
  locked?: Balance;
  showLockedTokens: boolean;
};

export const BalanceInfoDetails = ({
  isBalancesFirstSync,
  total,
  locked,
  showLockedTokens,
}: BalanceInfoDetailsProps) => {
  return (
    <View style={styles.row}>
      <First>
        {isBalancesFirstSync && (
          <>
            <Spacer height={8} />
            <Placeholder opacity={0.6}>
              <Placeholder.Item width={40} height={16} />
            </Placeholder>
          </>
        )}
        <View style={styles.lockedTokensContainer}>
          <Text
            variant={TextVariant.t15}
            color={Color.textSecond2}
            children={total?.toFiat()}
            suppressHighlighting={true}
          />
        </View>
      </First>

      {!!total?.toFiat() && <Spacer width={10} />}
      {showLockedTokens && (
        <First>
          {isBalancesFirstSync && (
            <>
              <Spacer height={8} />
              <Placeholder opacity={0.6}>
                <Placeholder.Item width={60} height={16} />
              </Placeholder>
            </>
          )}
          {locked?.isPositive() && (
            <View style={[styles.row, styles.lockedTokensContainer]}>
              <Icon i16 color={Color.textBase3} name={IconsName.lock} />
              <Spacer width={4} />
              <Text
                variant={TextVariant.t15}
                color={Color.textBase3}
                i18n={I18N.walletCardLocked}
                i18params={{count: locked?.toEtherString() ?? '0'}}
                suppressHighlighting={true}
              />
            </View>
          )}
        </First>
      )}
    </View>
  );
};

const styles = createTheme({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockedTokensContainer: {
    transform: [{translateY: -2}],
  },
});
