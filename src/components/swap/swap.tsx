import React, {useMemo} from 'react';

import {observer} from 'mobx-react';
import {View} from 'react-native';

import {createTheme} from '@app/helpers';
import {useSumAmount} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Balance} from '@app/services/balance';
import {
  SushiPoolEstimateResponse,
  SushiPoolResponse,
} from '@app/services/indexer';
import {IContract} from '@app/types';
import {STRINGS} from '@app/variables/common';

import {
  Button,
  ButtonSize,
  ButtonVariant,
  First,
  Spacer,
  Text,
  TextField,
  TextVariant,
} from '../ui';
import {Placeholder} from '../ui/placeholder';

export interface SwapProps {
  poolData: SushiPoolResponse;
  estimateData: SushiPoolEstimateResponse | null;
  tokenIn: IContract;
  tokenOut: IContract;
  amountsIn: ReturnType<typeof useSumAmount>;
  amountsOut: ReturnType<typeof useSumAmount>;
  isEstimating: boolean;
  isSwapInProgress: boolean;
  isApproveInProgress: boolean;
  estimate(): Promise<void>;
  onPressChangeTokenIn(): Promise<void>;
  onPressChangeTokenOut(): Promise<void>;
  onPressSwap(): Promise<void>;
  onPressApprove(): Promise<void>;
}

export const Swap = observer(
  ({
    amountsIn,
    amountsOut,
    estimateData,
    isEstimating,
    tokenIn,
    tokenOut,
    isApproveInProgress,
    isSwapInProgress,
    estimate,
    onPressChangeTokenIn,
    onPressChangeTokenOut,
    onPressApprove,
    onPressSwap,
  }: SwapProps) => {
    const t0 = useMemo(() => {
      if (!amountsIn.amount || !tokenIn?.decimals) {
        return Balance.Empty;
      }
      return new Balance(amountsIn.amount, tokenIn.decimals!, tokenIn.symbol!);
    }, [amountsIn.amount, tokenIn]);

    const t1 = useMemo(() => {
      if (!amountsOut.amount || !tokenOut?.decimals) {
        return Balance.Empty;
      }
      return new Balance(
        amountsOut.amount,
        tokenOut.decimals!,
        tokenOut.symbol!,
      );
    }, [amountsOut.amount, tokenOut]);

    const exchangeRate = useMemo(() => {
      return t1.toFloat() / t0.toFloat();
    }, [t1, t0]);

    return (
      <View style={styles.container}>
        <View>
          <View style={styles.amountContainer}>
            <TextField
              label={I18N.transactionDetailAmount}
              placeholder={I18N.transactionInfoFunctionValue}
              value={amountsIn.amount}
              onChangeText={amountsIn.setAmount}
              style={styles.amountInput}
              // error={!!amountsIn.error}
              // errorText={amountsIn.error}
              keyboardType="numeric"
              inputMode="decimal"
              returnKeyType="done"
              editable={!isEstimating}
              onBlur={estimate}
            />
            <Spacer width={10} />
            <Button
              size={ButtonSize.small}
              style={styles.tokenButton}
              variant={ButtonVariant.second}
              title={tokenIn.symbol!}
              onPress={onPressChangeTokenIn}
            />
          </View>
          <Text>{t0.toFiat({fixed: 18})}</Text>
        </View>

        <Spacer height={10} />

        <View>
          <View style={styles.amountContainer}>
            <First>
              {isEstimating && (
                <View style={styles.amountInput}>
                  <Placeholder opacity={0.7}>
                    <Placeholder.Item width={'100%'} height={58} />
                  </Placeholder>
                </View>
              )}
              <TextField
                label={I18N.transactionDetailAmount}
                placeholder={I18N.transactionInfoFunctionValue}
                value={amountsOut.amount}
                onChangeText={amountsOut.setAmount}
                style={styles.amountInput}
                // error={!!amountsOut.error}
                // errorText={amountsOut.error}
                keyboardType="numeric"
                inputMode="decimal"
                returnKeyType="done"
                editable={false}
              />
            </First>
            <Spacer width={10} />
            <Button
              size={ButtonSize.small}
              style={styles.tokenButton}
              variant={ButtonVariant.second}
              title={tokenOut.symbol!}
              onPress={onPressChangeTokenOut}
            />
          </View>
          <Text>{t1.toFiat({fixed: 18})}</Text>
        </View>
        <Spacer height={10} />

        {!!estimateData && (
          <View>
            <Text variant={TextVariant.t11}>
              Provider fee: {new Balance(estimateData.fee.amount).toFloat()}
              {STRINGS.NBSP}
              {estimateData.fee.denom}
            </Text>
            <Text variant={TextVariant.t11}>
              Price impact: {estimateData.s_price_impact}%
            </Text>
            <Text variant={TextVariant.t11}>Routing source: SwapRouterV3</Text>
            <Text variant={TextVariant.t11}>Exchange rate: {exchangeRate}</Text>
          </View>
        )}

        <Spacer />

        <First>
          {!!estimateData?.need_approve && (
            <Button
              variant={ButtonVariant.contained}
              title={`Approve ${amountsIn.amount} ${tokenIn.symbol}`}
              loading={isApproveInProgress}
              disabled={isApproveInProgress}
              onPress={onPressApprove}
            />
          )}
          <Button
            variant={ButtonVariant.contained}
            title="Swap"
            loading={isEstimating || isSwapInProgress}
            disabled={isEstimating || isSwapInProgress}
            onPress={onPressSwap}
          />
        </First>
        <Spacer height={50} />
      </View>
    );
  },
);

const styles = createTheme({
  container: {
    marginHorizontal: 20,
    flex: 1,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountInput: {
    flex: 3.8,
  },
  tokenButton: {
    flex: 1,
    height: '100%',
  },
});
