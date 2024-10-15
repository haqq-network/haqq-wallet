import React, {useMemo} from 'react';

import {observer} from 'mobx-react';
import {KeyboardAvoidingView, View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {shortAddress} from '@app/helpers/short-address';
import {useSumAmount} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Currencies} from '@app/models/currencies';
import {Provider} from '@app/models/provider';
import {Token} from '@app/models/tokens';
import {WalletModel} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {
  SushiPoolEstimateResponse,
  SushiPoolResponse,
  SushiRoute,
} from '@app/services/indexer';
import {IToken} from '@app/types';
import {
  IS_IOS,
  LONG_NUM_PRECISION,
  SPACE_OR_NBSP,
  STRINGS,
} from '@app/variables/common';

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
  currentWallet: WalletModel;
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
  rate: string;
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
    rate,
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

    const minReceivedFormatted = useMemo(() => {
      const balance = minReceivedAmount
        .toBalanceString('auto', undefined, false, true)
        .replaceAll(SPACE_OR_NBSP, '');

      const parsed = parseFloat(balance);

      if (Number.isNaN(parsed)) {
        return [0, minReceivedAmount.getSymbol()];
      }

      return `${parseFloat(balance!)}${
        STRINGS.NBSP
      }${minReceivedAmount.getSymbol()}`;
    }, [minReceivedAmount]);

    const priceImpactFormatted = useMemo(() => {
      const PI = parseFloat(estimateData?.s_price_impact!).toFixed(
        LONG_NUM_PRECISION,
      );
      return `${PI}${STRINGS.NBSP}${'%'}`;
    }, [estimateData]);

    const providerFeeFormatted = useMemo(() => {
      const symbol =
        Currencies.currency?.postfix || Currencies.currency?.prefix;
      const balance = providerFee
        .toFiat({
          useDefaultCurrency: false,
          withoutSymbol: true,
        })
        .replaceAll(SPACE_OR_NBSP, '');

      const parsed = parseFloat(balance);

      if (Number.isNaN(parsed)) {
        return `${0}${STRINGS.NBSP}${symbol}`;
      }

      return `${parsed}${STRINGS.NBSP}${symbol}`;
    }, [providerFee]);

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
                    value={providerFeeFormatted}
                  />
                  <EstimatedValue
                    title={I18N.swapScreenPriceImpact}
                    valueColor={priceImpactColor}
                    value={priceImpactFormatted}
                  />
                  <EstimatedValue
                    title={I18N.swapScreenMinimumReceived}
                    value={minReceivedFormatted}
                  />
                </>
              )}

              <First>
                {(isWrapTx || isUnwrapTx) && (
                  <EstimatedValue
                    title={I18N.swapScreenRoutingSource}
                    value={`${Token.getById(
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
