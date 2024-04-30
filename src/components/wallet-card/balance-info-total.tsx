import React, {useMemo} from 'react';

import {observer} from 'mobx-react';
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
import {Currencies} from '@app/models/currencies';
import {Balance} from '@app/services/balance';
import {CARD_ACTION_CONTAINER_BG} from '@app/variables/common';

type BalanceInfoTotalProps = {
  isBalancesFirstSync: boolean;
  total?: Balance;
};

export const BalanceInfoTotal = observer(
  ({total, isBalancesFirstSync}: BalanceInfoTotalProps) => {
    const parsedTotal = useMemo(() => {
      let result = total;

      if (!result) {
        result = Balance.Empty;
      }

      return result.toBalanceString();
    }, [total, Currencies.selectedCurrency, Currencies.isRatesAvailable]);

    return (
      <First>
        {isBalancesFirstSync && (
          <>
            <Placeholder opacity={0.6}>
              <Placeholder.Item width={110} height={38} />
            </Placeholder>
            <Spacer height={10} />
          </>
        )}
        <View style={styles.row}>
          <Text
            testID="current-total"
            variant={TextVariant.t0}
            color={Color.textBase3}
            numberOfLines={1}
            adjustsFontSizeToFit
            suppressHighlighting={true}>
            {parsedTotal}
          </Text>

          <View style={styles.openDetailsIconContainer}>
            <Icon
              i16
              name={IconsName.arrow_forward}
              color={Color.graphicBase3}
              style={styles.openDetailsIcon}
            />
          </View>
        </View>
      </First>
    );
  },
);

const styles = createTheme({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  openDetailsIconContainer: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    width: 24,
    borderRadius: 8,
    transform: [{translateY: -4}],
    backgroundColor: CARD_ACTION_CONTAINER_BG,
  },
  openDetailsIcon: {
    transform: [{translateX: -4}],
  },
});
