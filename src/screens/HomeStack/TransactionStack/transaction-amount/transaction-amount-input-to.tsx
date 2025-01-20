import {useCallback, useMemo} from 'react';

import {observer} from 'mobx-react';
import {TextInput, View} from 'react-native';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';

import {TransactionAmountInputToProps} from './transaction-amount.types';

import {TransactionStore} from '../transaction-store';

export const TransactionAmountInputTo = observer(
  ({alignItems = 'center'}: TransactionAmountInputToProps) => {
    const {toAmount} = TransactionStore;
    const {wallet, fromChainId} = TransactionStore;
    const provider = Provider.getByEthChainId(fromChainId!);
    const balances = Wallet.getBalancesByAddressList([wallet!], provider);
    const currentBalance = useMemo(
      () => balances[wallet.address],
      [balances, wallet.address],
    );

    const handleChangeText = useCallback((value: string) => {
      const v = value.replace(',', '.');
      if (isNaN(Number(v))) {
        return;
      }
      TransactionStore.fromAmount = v;
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
            fiat: currentBalance.available.toFiat(),
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
