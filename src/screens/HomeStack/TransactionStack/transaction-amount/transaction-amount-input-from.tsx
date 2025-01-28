import {useCallback, useMemo} from 'react';

import {observer} from 'mobx-react';
import {TextInput, View} from 'react-native';

import {Color} from '@app/colors';
import {Text, TextPosition, TextVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';

import {TransactionAmountInputFromProps} from './transaction-amount.types';

import {TransactionStore} from '../transaction-store';

export const TransactionAmountInputFrom = observer(
  ({
    alignItems = 'center',
    error,
    setError,
  }: TransactionAmountInputFromProps) => {
    const {fromAmount, fromAsset, isCrossChain, quoteError} = TransactionStore;
    const {wallet, fromChainId} = TransactionStore;
    const provider = Provider.getByEthChainId(fromChainId!);
    const balances = Wallet.getBalancesByAddressList([wallet!], provider);
    const availableAmount = useMemo(() => {
      return (
        fromAsset?.value ||
        new Balance(
          0,
          fromAsset?.decimals ?? undefined,
          fromAsset?.symbol ?? undefined,
        )
      );
    }, [balances, wallet.address]);

    const handleChangeText = useCallback(
      (value: string) => {
        const v = value.replace(',', '.');

        if (isNaN(Number(v))) {
          return;
        }

        if (Number(v) > availableAmount.toFloat() && !error) {
          setError?.(
            getText(I18N.sumAmountNotEnough, {
              symbol: provider?.denom ?? '',
            }),
          );
        } else {
          Number(v) <= availableAmount.toFloat() && error && setError('');
        }

        TransactionStore.fromAmount = v;

        if (isCrossChain) {
          TransactionStore.toAmount = String(Number(v) / 2);
        }
      },
      [error],
    );

    return (
      <View style={[styles.container, {alignItems}]}>
        <Text
          i18n={I18N.availableAmount}
          i18params={{
            amount: availableAmount.toBalanceString(),
          }}
          color={Color.textBase2}
        />
        <TextInput
          allowFontScaling={false}
          style={styles.input}
          value={fromAmount}
          placeholder="0"
          onChangeText={handleChangeText}
          keyboardType="numeric"
          inputMode="decimal"
          textAlign="right"
          selectionColor={Color.textGreen1}
        />
        <Text
          i18n={I18N.approximatelyFiatAmount}
          i18params={{
            fiat:
              new Balance(
                Number(fromAmount ?? 0),
                fromAsset?.decimals ?? undefined,
                fromAsset?.symbol ?? undefined,
              ).toFiat() || '0',
          }}
          color={Color.textBase2}
        />
        {(error || quoteError) && (
          <Text
            position={TextPosition.center}
            color={Color.textRed1}
            variant={TextVariant.t14}>
            {error || quoteError}
          </Text>
        )}
      </View>
    );
  },
);

const styles = createTheme({
  container: {
    justifyContent: 'flex-end',
    flexShrink: 1,
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
