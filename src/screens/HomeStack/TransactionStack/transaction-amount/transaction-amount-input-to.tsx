import {useCallback} from 'react';

import {observer} from 'mobx-react';
import {TextInput, View} from 'react-native';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Balance} from '@app/services/balance';

import {TransactionAmountInputToProps} from './transaction-amount.types';

import {TransactionStore} from '../transaction-store';

export const TransactionAmountInputTo = observer(
  ({alignItems = 'center'}: TransactionAmountInputToProps) => {
    const {toAmount, toAsset, isCrossChain} = TransactionStore;

    const handleChangeText = useCallback((value: string) => {
      const v = value.replace(',', '.');
      if (isNaN(Number(v))) {
        return;
      }
      TransactionStore.toAmount = v;

      if (isCrossChain) {
        TransactionStore.fromAmount = String(Number(v) / 2);
      }
    }, []);

    return (
      <View style={[styles.container, {alignItems}]}>
        <TextInput
          allowFontScaling={false}
          style={styles.input}
          value={toAmount}
          placeholder="0"
          onChangeText={handleChangeText}
          keyboardType="decimal-pad"
          inputMode="decimal"
          textAlign="right"
          selectionColor={Color.textGreen1}
        />
        <Text
          i18n={I18N.approximatelyFiatAmount}
          i18params={{
            fiat:
              new Balance(
                Number(toAmount ?? 0),
                toAsset?.decimals ?? undefined,
                toAsset?.symbol ?? undefined,
              ).toFiat() || '0',
          }}
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
