import React, {useMemo} from 'react';

import Decimal from 'decimal.js';
import {observer} from 'mobx-react';
import {KeyboardAvoidingView, View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {shortAddress} from '@app/helpers/short-address';
import {useSumAmount} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Contracts} from '@app/models/contracts';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {
  SushiPoolEstimateResponse,
  SushiPoolResponse,
  SushiRoute,
} from '@app/services/indexer';
import {IToken} from '@app/types';
import {formatNumberString} from '@app/utils';
import {IS_IOS, STRINGS} from '@app/variables/common';

import {EstimatedValue} from './estimated-value';
import {SwapInput} from './swap-input';
import {
  SwapRoutePathIcons,
  SwapRoutePathIconsType,
} from './swap-route-path-icons';
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

export type PoolsData = Omit<SushiPoolResponse, 'contracts'> & {
  contracts: IToken[];
};

export interface SwapProps {
  currentWallet: Wallet;
  poolData: PoolsData;
  estimateData: Partial<SushiPoolEstimateResponse>;
  tokenIn: IToken;
  tokenOut: IToken;
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
    const insets = useSafeAreaInsets();
    const isHeaderButtonsDisabled =
      isEstimating || isSwapInProgress || isApproveInProgress;

    const isInfussentBalance = useMemo(() => {
      return t0Current.compare(t0Available, 'gt');
    }, [t0Available, t0Current]);

    const isSwapButtonDisabled = useMemo(() => {
      return (
        isEstimating ||
        isSwapInProgress ||
        !!amountsIn.error ||
        !t0Current.isPositive() ||
        isInfussentBalance
      );
    }, [
      isEstimating,
      isSwapInProgress,
      amountsIn.error,
      t0Current,
      isInfussentBalance,
    ]);

    const isApproveButtonDisabled = useMemo(() => {
      return (
        isApproveInProgress ||
        !!amountsIn.error ||
        !t0Current.isPositive() ||
        isInfussentBalance
      );
    }, [isApproveInProgress, amountsIn.error, t0Current, isInfussentBalance]);

    const rate = useMemo(() => {
      if (!amountsIn.amount || !amountsOut.amount) {
        return '0';
      }

      const t0 = new Decimal(amountsIn.amount);
      const t1 = new Decimal(amountsOut.amount);

      return t1
        .div(t0)
        .toString()
        .concat(STRINGS.NBSP)
        .concat(tokenOut.symbol!);
    }, [amountsIn.amount, amountsOut.amount]);

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
        <KeyboardAvoidingView
          behavior={IS_IOS ? 'padding' : undefined}
          style={styles.keyboardAvoidingView}>
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
                <Icon
                  i24
                  name={IconsName.settings}
                  color={Color.graphicGreen1}
                />
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

          {!!estimateData?.route && (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <EstimatedValue
                title={I18N.swapScreenRate}
                value={`1${STRINGS.NBSP}${t0Current.getSymbol()}${
                  STRINGS.NBSP
                }≈${STRINGS.NBSP}${rate}`}
              />
              {!isWrapTx && !isUnwrapTx && (
                <>
                  <EstimatedValue
                    title={I18N.swapScreenProviderFee}
                    value={providerFee.toFiat({
                      useDefaultCurrency: true,
                      fixed: 6,
                    })}
                  />
                  <EstimatedValue
                    title={I18N.swapScreenPriceImpact}
                    valueColor={priceImpactColor}
                    value={`${formatNumberString(
                      estimateData.s_price_impact || '0',
                    )}${STRINGS.NBSP}%`}
                  />
                  <EstimatedValue
                    title={I18N.swapScreenMinimumReceived}
                    value={minReceivedAmount.toBalanceString('auto')}
                  />
                </>
              )}

              <First>
                {(isWrapTx || isUnwrapTx) && (
                  <EstimatedValue
                    title={I18N.swapScreenRoutingSource}
                    value={`${Contracts.getById(
                      Provider.selectedProvider.config.wethAddress,
                    )?.name}${STRINGS.NBSP}${shortAddress(
                      Provider.selectedProvider.config.wethAddress!,
                      '•',
                      true,
                    )}`}
                  />
                )}
                <EstimatedValue
                  title={I18N.swapScreenRoutingSource}
                  value={'SwapRouterV3'}
                />
              </First>

              <EstimatedValue
                title={I18N.swapScreenRoute}
                value={
                  <SwapRoutePathIcons
                    type={SwapRoutePathIconsType.route}
                    route={currentRoute.route}
                  />
                }
              />
            </Animated.View>
          )}

          <Spacer />

          <Animated.View
            style={{bottom: insets.bottom + 25, ...styles.button_container}}
            entering={FadeIn}
            exiting={FadeOut}>
            <First>
              {isUnwrapTx && (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                  <Button
                    variant={ButtonVariant.contained}
                    i18n={I18N.swapScreenUnwrap}
                    loading={isEstimating || isSwapInProgress}
                    disabled={isSwapButtonDisabled}
                    onPress={onPressUnrap}
                  />
                </Animated.View>
              )}
              {isWrapTx && (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                  <Button
                    variant={ButtonVariant.contained}
                    i18n={I18N.swapScreenWrap}
                    loading={isEstimating || isSwapInProgress}
                    disabled={isSwapButtonDisabled}
                    onPress={onPressWrap}
                  />
                </Animated.View>
              )}
              {!!estimateData?.need_approve && (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                  <Button
                    variant={ButtonVariant.contained}
                    i18n={I18N.swapScreenApprove}
                    i18params={{
                      symbol: tokenIn.symbol || Provider.selectedProvider.denom,
                      amount: amountsIn.amount,
                    }}
                    loading={isApproveInProgress}
                    disabled={isApproveButtonDisabled}
                    onPress={onPressApprove}
                  />
                </Animated.View>
              )}
              <Animated.View entering={FadeIn} exiting={FadeOut}>
                <Button
                  variant={ButtonVariant.contained}
                  i18n={I18N.swapScreenSwap}
                  loading={isEstimating || isSwapInProgress}
                  disabled={isSwapButtonDisabled}
                  onPress={onPressSwap}
                />
              </Animated.View>
            </First>
          </Animated.View>
        </KeyboardAvoidingView>

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
  keyboardAvoidingView: {
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
  button_container: {
    position: 'absolute',
    width: '100%',
  },
});
