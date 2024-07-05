import React, {useMemo} from 'react';

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
  SushiRoute,
} from '@app/services/indexer';
import {IContract} from '@app/types';
import {formatNumberString} from '@app/utils';
import {CURRENCY_NAME, STRINGS} from '@app/variables/common';

import {EstimatedValue} from './estimated-value';
import {SwapInput} from './swap-input';
import {SwapRoutePathIcons} from './swap-route-path-icons';
import {
  SwapSettingBottomSheet,
  SwapSettingBottomSheetRef,
  SwapTransactionSettings,
} from './swap-settings-bottom-sheet';

import {DismissPopupButton} from '../popup/dismiss-popup-button';
import {
  Button,
  ButtonVariant,
  First,
  Icon,
  IconButton,
  IconsName,
  KeyboardSafeArea,
  Spacer,
  Text,
  TextVariant,
} from '../ui';
import {WalletRow, WalletRowTypes} from '../wallet-row';

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
  providerFee: Balance;
  minReceivedAmount: Balance;
  swapSettingsRef: React.RefObject<SwapSettingBottomSheetRef>;
  swapSettings: SwapTransactionSettings;
  currentRoute: SushiRoute;
  onSettingsChange: (settings: SwapTransactionSettings) => void;
  onPressWrap(): Promise<void>;
  onPressUnrap(): Promise<void>;
  onPressMax(): Promise<void>;
  onInputBlur(): Promise<void>;
  onPressChangeTokenIn(): Promise<void>;
  onPressChangeTokenOut(): Promise<void>;
  onPressSwap(): Promise<void>;
  onPressApprove(): Promise<void>;
  onPressChangeWallet(): void;
  onPressChangeDirection(): void;
  onPressSettings(): void;
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
    providerFee,
    swapSettingsRef,
    swapSettings,
    minReceivedAmount,
    currentRoute,
    onSettingsChange,
    onPressWrap,
    onPressUnrap,
    onPressChangeTokenIn,
    onPressChangeTokenOut,
    onPressApprove,
    onPressChangeWallet,
    onPressSwap,
    onInputBlur,
    onPressMax,
    onPressChangeDirection,
    onPressSettings,
  }: SwapProps) => {
    const isHeaderButtonsDisabled =
      isEstimating || isSwapInProgress || isApproveInProgress;

    const rate = useMemo(() => {
      const r =
        t1Current.toFloat() /
        new Balance(
          estimateData?.amount_in!,
          t0Current.getPrecission(),
          t0Current.getSymbol(),
        ).toFloat();
      return new Balance(r, 0, t1Current.getSymbol()).toBalanceString('auto');
    }, [t1Current, t0Current, estimateData]);

    const priceImpactColor = useMemo(() => {
      if (!estimateData?.s_price_impact) {
        return Color.textBase1;
      }

      const PI = parseFloat(estimateData.s_price_impact);

      if (PI >= 5) {
        return Color.textRed1;
      }

      if (PI >= 1) {
        return Color.textYellow1;
      }

      return Color.textBase1;
    }, [estimateData]);
    return (
      <KeyboardSafeArea style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerButtonsContainer}>
            <IconButton
              onPress={onPressChangeDirection}
              disabled={isHeaderButtonsDisabled}>
              <Icon
                i24
                name={IconsName.swap_vertical}
                color={Color.graphicGreen1}
              />
            </IconButton>
            <Spacer width={10} />
            <IconButton
              onPress={onPressSettings}
              disabled={isHeaderButtonsDisabled}>
              <Icon i24 name={IconsName.settings} color={Color.graphicGreen1} />
            </IconButton>
          </View>
          <Spacer flex={1} />
          <Text variant={TextVariant.t8} i18n={I18N.swapScreenTitle} />
          <Spacer flex={1} />
          <WalletRow
            item={currentWallet}
            type={WalletRowTypes.variant3}
            onPress={onPressChangeWallet}
          />
          <Spacer width={10} />
          <DismissPopupButton />
        </View>

        <Spacer height={12} />

        <SwapInput
          label={I18N.transactionDetailAmountIn}
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
          onBlur={onInputBlur}
          onPressChangeToken={onPressChangeTokenIn}
        />

        <Spacer height={24} />

        <SwapInput
          label={I18N.transactionDetailAmountOut}
          placeholder={I18N.transactionInfoFunctionValue}
          amounts={amountsOut}
          editable={false}
          currentBalance={t1Current}
          availableBalance={t1Available}
          isLoading={isEstimating}
          token={tokenOut}
          onPressChangeToken={onPressChangeTokenOut}
        />

        <Spacer height={24} />

        {!!estimateData && (
          <View>
            <EstimatedValue
              title={I18N.swapScreenRate}
              value={`1${STRINGS.NBSP}${t0Current.getSymbol()}${STRINGS.NBSP}≈${
                STRINGS.NBSP
              }${rate}`}
            />
            <EstimatedValue
              title={I18N.swapScreenProviderFee}
              value={providerFee.toFiat({useDefaultCurrency: true, fixed: 6})}
            />
            <EstimatedValue
              title={I18N.swapScreenPriceImpact}
              valueColor={priceImpactColor}
              value={`${formatNumberString(estimateData.s_price_impact)}%`}
            />
            <EstimatedValue
              title={I18N.swapScreenRoutingSource}
              value={'SwapRouterV3'}
            />
            <EstimatedValue
              title={I18N.swapScreenMinimumReceived}
              value={minReceivedAmount.toBalanceString('auto')}
            />

            <EstimatedValue
              title={I18N.swapScreenRoute}
              value={<SwapRoutePathIcons route={currentRoute.route} />}
            />
          </View>
        )}

        <Spacer />

        <First>
          {isUnwrapTx && (
            <Button
              variant={ButtonVariant.contained}
              i18n={I18N.swapScreenUnwrap}
              loading={isEstimating || isSwapInProgress}
              disabled={isEstimating || isSwapInProgress || !!amountsIn.error}
              onPress={onPressUnrap}
            />
          )}
          {isWrapTx && (
            <Button
              variant={ButtonVariant.contained}
              i18n={I18N.swapScreenWrap}
              loading={isEstimating || isSwapInProgress}
              disabled={isEstimating || isSwapInProgress || !!amountsIn.error}
              onPress={onPressWrap}
            />
          )}
          {!!estimateData?.need_approve && (
            <Button
              variant={ButtonVariant.contained}
              i18n={I18N.swapScreenApprove}
              i18params={{
                symbol: tokenIn.symbol || CURRENCY_NAME,
                amount: amountsIn.amount,
              }}
              loading={isApproveInProgress}
              disabled={isApproveInProgress || !!amountsIn.error}
              onPress={onPressApprove}
            />
          )}
          <Button
            variant={ButtonVariant.contained}
            i18n={I18N.swapScreenSwap}
            loading={isEstimating || isSwapInProgress}
            disabled={isEstimating || isSwapInProgress || !!amountsIn.error}
            onPress={onPressSwap}
          />
        </First>

        <SwapSettingBottomSheet
          ref={swapSettingsRef}
          value={swapSettings}
          onSettingsChange={onSettingsChange}
        />
      </KeyboardSafeArea>
    );
  },
);

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    marginTop: 12,
  },
  headerButtonsContainer: {
    flexDirection: 'row',
  },
});
