import React from 'react';

import {observer} from 'mobx-react';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {useSumAmount} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {
  SushiPoolEstimateResponse,
  SushiPoolResponse,
} from '@app/services/indexer';
import {IContract} from '@app/types';
import {formatNumberString} from '@app/utils';
import {STRINGS} from '@app/variables/common';

import {SwapInput} from './swap-input';

import {Button, ButtonVariant, First, Spacer, Text, TextVariant} from '../ui';
import {WalletRow, WalletRowTypes} from '../wallet-row';

const EstimatedValue = observer(
  ({title, value}: {title: string; value: string}) => {
    return (
      <View style={styles.estimatedValueContainer}>
        <Text variant={TextVariant.t14} color={Color.textBase2}>
          {title}
        </Text>
        <Spacer />
        <Text variant={TextVariant.t14} color={Color.textBase1}>
          {value}
        </Text>
      </View>
    );
  },
);

export interface SwapProps {
  currentWallet: Wallet;
  poolData: SushiPoolResponse;
  estimateData: SushiPoolEstimateResponse | null;
  tokenIn: IContract;
  tokenOut: IContract;
  amountsIn: ReturnType<typeof useSumAmount>;
  amountsOut: ReturnType<typeof useSumAmount>;
  isEstimating: boolean;
  isSwapInProgress: boolean;
  isApproveInProgress: boolean;
  isWrapTx: boolean;
  isUnwrapTx: boolean;
  t0Current: Balance;
  t1Current: Balance;
  t0Available: Balance;
  t1Available: Balance;
  onPressWrap(): Promise<void>;
  onPressUnrap(): Promise<void>;
  estimate(): Promise<void>;
  onPressMax(): Promise<void>;
  onPressChangeTokenIn(): Promise<void>;
  onPressChangeTokenOut(): Promise<void>;
  onPressSwap(): Promise<void>;
  onPressApprove(): Promise<void>;
  onPressChangeWallet(): void;
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
    isUnwrapTx,
    isWrapTx,
    t0Current,
    t1Current,
    t0Available,
    t1Available,
    currentWallet,
    onPressWrap,
    onPressUnrap,
    estimate,
    onPressChangeTokenIn,
    onPressChangeTokenOut,
    onPressApprove,
    onPressChangeWallet,
    onPressSwap,
    onPressMax,
  }: SwapProps) => {
    return (
      <View style={styles.container}>
        <WalletRow
          item={currentWallet}
          hideArrow
          type={WalletRowTypes.variant2}
          onPress={onPressChangeWallet}
        />

        <Spacer height={10} />

        <SwapInput
          label={I18N.transactionDetailAmount}
          placeholder={I18N.transactionInfoFunctionValue}
          amounts={amountsIn}
          isLoading={isEstimating}
          currentBalance={t0Current}
          availableBalance={t0Available}
          token={tokenIn}
          disableTextFieldLoader={true}
          autoFocus={true}
          showMaxButton={true}
          onPressMax={onPressMax}
          onBlur={estimate}
          onPressChangeToken={onPressChangeTokenIn}
        />

        <Spacer height={10} />

        <SwapInput
          label={I18N.transactionDetailAmount}
          placeholder={I18N.transactionInfoFunctionValue}
          amounts={amountsOut}
          editable={false}
          currentBalance={t1Current}
          availableBalance={t1Available}
          isLoading={isEstimating}
          token={tokenOut}
          onBlur={estimate}
          onPressChangeToken={onPressChangeTokenOut}
        />

        <Spacer height={10} />

        {!!estimateData && (
          <View>
            <EstimatedValue
              title="Rate"
              value={`1${STRINGS.NBSP}${t0Current.getSymbol()}${STRINGS.NBSP}≈${
                STRINGS.NBSP
              }${formatNumberString(estimateData.s_swap_price)}${
                STRINGS.NBSP
              }${t1Current.getSymbol()}`}
            />
            <EstimatedValue
              title="Provider Fee"
              value={`${new Balance(estimateData.fee.amount).toFloat()}${
                STRINGS.NBSP
              }${estimateData.fee.denom}`}
            />
            <EstimatedValue
              title="Price impact"
              value={`${formatNumberString(estimateData.s_price_impact)}%`}
            />
            <EstimatedValue title="Routing source" value={'SwapRouterV3'} />
          </View>
        )}

        <Spacer />

        <First>
          {isUnwrapTx && (
            <Button
              variant={ButtonVariant.contained}
              title="Unwrap"
              loading={isEstimating || isSwapInProgress}
              disabled={isEstimating || isSwapInProgress || !!amountsIn.error}
              onPress={onPressUnrap}
            />
          )}
          {isWrapTx && (
            <Button
              variant={ButtonVariant.contained}
              title="Wrap"
              loading={isEstimating || isSwapInProgress}
              disabled={isEstimating || isSwapInProgress || !!amountsIn.error}
              onPress={onPressWrap}
            />
          )}
          {!!estimateData?.need_approve && (
            <Button
              variant={ButtonVariant.contained}
              title={`Approve ${amountsIn.amount} ${tokenIn.symbol}`}
              loading={isApproveInProgress}
              disabled={isApproveInProgress || !!amountsIn.error}
              onPress={onPressApprove}
            />
          )}
          <Button
            variant={ButtonVariant.contained}
            title="Swap"
            loading={isEstimating || isSwapInProgress}
            disabled={isEstimating || isSwapInProgress || !!amountsIn.error}
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
  estimatedValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
