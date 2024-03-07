import React, {useMemo} from 'react';

import {observer} from 'mobx-react';
import {TouchableWithoutFeedback, View} from 'react-native';

import {First, Icon, IconsName, Text, TextVariant} from '@app/components/ui';
import {Placeholder} from '@app/components/ui/placeholder';
import {Currencies} from '@app/models/currencies';
import {Balance} from '@app/services/balance';
import {Color, createTheme} from '@app/theme';
import {CARD_ACTION_CONTAINER_BG} from '@app/variables/common';

type BalanceInfoTotalProps = {
  isBalancesFirstSync: boolean;
  total?: Balance;
  onAccountInfo: () => void;
};

export const BalanceInfoTotal = observer(
  ({total, isBalancesFirstSync, onAccountInfo}: BalanceInfoTotalProps) => {
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
          <Placeholder opacity={0.6}>
            <Placeholder.Item width={110} height={35} />
          </Placeholder>
        )}
        <View style={styles.row}>
          <Text
            variant={TextVariant.t0}
            color={Color.textBase3}
            numberOfLines={1}
            adjustsFontSizeToFit
            onPress={onAccountInfo}
            suppressHighlighting={true}>
            {parsedTotal}
          </Text>
          <TouchableWithoutFeedback
            testID="accountInfoButton"
            onPress={onAccountInfo}>
            <View style={styles.openDetailsIconContainer}>
              <Icon
                i16
                name={IconsName.arrow_forward}
                color={Color.graphicBase3}
                style={styles.openDetailsIcon}
              />
            </View>
          </TouchableWithoutFeedback>
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
