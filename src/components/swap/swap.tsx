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
import {STRINGS} from '@app/variables/common';

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
          <Text variant={TextVariant.t8}>Swap</Text>
          {/* width of buttons */}
          <Spacer width={34} />
          <Spacer flex={1} />
          <DismissPopupButton />
        </View>

        <WalletRow
          item={currentWallet}
          type={WalletRowTypes.variant2}
          onPress={onPressChangeWallet}
        />

        <Spacer height={12} />

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
          onBlur={onInputBlur}
          onPressChangeToken={onPressChangeTokenIn}
        />

        <Spacer height={12} />

        <SwapInput
          label={I18N.transactionDetailAmount}
          placeholder={I18N.transactionInfoFunctionValue}
          amounts={amountsOut}
          editable={false}
          currentBalance={t1Current}
          availableBalance={t1Available}
          isLoading={isEstimating}
          token={tokenOut}
          onPressChangeToken={onPressChangeTokenOut}
        />

        <Spacer height={12} />

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
              value={providerFee.toFiat({useDefaultCurrency: true, fixed: 6})}
            />
            <EstimatedValue
              title="Price impact"
              valueColor={priceImpactColor}
              value={`${formatNumberString(estimateData.s_price_impact)}%`}
            />
            <EstimatedValue title="Routing source" value={'SwapRouterV3'} />
            <EstimatedValue
              title="Min received"
              value={minReceivedAmount.toBalanceString('auto')}
            />

            <EstimatedValue
              title="Route"
              value={<SwapRoutePathIcons route={currentRoute.route} />}
            />
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
    marginVertical: 16,
  },
  headerButtonsContainer: {
    flexDirection: 'row',
  },
});
