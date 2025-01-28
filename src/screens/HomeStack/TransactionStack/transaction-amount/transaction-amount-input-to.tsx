import {useMemo} from 'react';

import {observer} from 'mobx-react';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Balance} from '@app/services/balance';

import {TransactionAmountInputToProps} from './transaction-amount.types';

import {TransactionStore} from '../transaction-store';

export const TransactionAmountInputTo = observer(
  ({alignItems = 'center'}: TransactionAmountInputToProps) => {
    const {toAmount, toAsset} = TransactionStore;

    const amount = useMemo(
      () =>
        new Balance(
          Number(Number(toAmount) ?? 0),
          toAsset?.decimals ?? undefined,
          toAsset?.symbol ?? undefined,
        ),
      [toAmount, toAsset],
    );

    return (
      <View style={[styles.container, {alignItems}]}>
        <Text style={styles.input} selectionColor={Color.textGreen1}>
          {amount.toFloatString() || 0}
        </Text>
        <Text
          i18n={I18N.approximatelyFiatAmount}
          i18params={{fiat: amount.toFiat()}}
          color={Color.textBase2}
        />
      </View>
    );
  },
);

const styles = createTheme({
  container: {
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  input: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 'auto',
    fontWeight: '700',
    fontSize: 34,
    lineHeight: 46,
    color: Color.textBase1,
    marginVertical: 4,
    paddingHorizontal: 0,
  },
});
