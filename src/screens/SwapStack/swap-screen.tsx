import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {useFocusEffect} from '@react-navigation/native';
import Decimal from 'decimal.js';
import {ethers} from 'ethers';
import {observer} from 'mobx-react';
import {Alert, Keyboard, View} from 'react-native';
import Toast from 'react-native-toast-message';

import {
  PoolsData,
  SWAP_SETTINGS_DEFAULT,
  Swap,
  SwapSettingBottomSheetRef,
  SwapTransactionSettings,
} from '@app/components/swap';
import {Loading} from '@app/components/ui';
import {WalletCard} from '@app/components/ui/walletCard';
import {app} from '@app/contexts';
import {awaitForWallet, showModal} from '@app/helpers';
import {AddressUtils, NATIVE_TOKEN_ADDRESS} from '@app/helpers/address-utils';
import {awaitForJsonRpcSign} from '@app/helpers/await-for-json-rpc-sign';
import {awaitForProvider} from '@app/helpers/await-for-provider';
import {AwaitValue, awaitForValue} from '@app/helpers/await-for-value';
import {getRpcProvider} from '@app/helpers/get-rpc-provider';
import {useSumAmount, useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useBackNavigationHandler} from '@app/hooks/use-back-navigation-handler';
import {useLayoutAnimation} from '@app/hooks/use-layout-animation';
import {usePrevious} from '@app/hooks/use-previous';
import {I18N, getText} from '@app/i18n';
import {AppStore} from '@app/models/app';
import {Currencies} from '@app/models/currencies';
import {Provider} from '@app/models/provider';
import {Token} from '@app/models/tokens';
import {Wallet, WalletModel} from '@app/models/wallet';
import {SwapStackParamList, SwapStackRoutes} from '@app/route-types';
import {Balance} from '@app/services/balance';
import {EventTracker} from '@app/services/event-tracker';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {
  Indexer,
  SushiPoolEstimateResponse,
  SushiRoute,
} from '@app/services/indexer';
import {
  AddressCosmosHaqq,
  AddressEthereum,
  IToken,
  MarketingEvents,
  ModalType,
} from '@app/types';
import {ERC20_ABI, V3SWAPROUTER_ABI, WETH_ABI} from '@app/variables/abi';
import {
  HAQQ_METADATA,
  LONG_NUM_PRECISION,
  NUM_PRECISION,
  STRINGS,
  ZERO_HEX_NUMBER,
} from '@app/variables/common';

const logger = Logger.create('SwapScreen', {
  emodjiPrefix: '🟠',
  stringifyJson: __DEV__ || AppStore.isDeveloperModeEnabled || app.isTesterMode,
});

const START_SWAP_AMOUNT = new Balance(0, 0);
const MIN_SWAP_AMOUNT = new Balance(0.0000001, 0);

const getMinAmountForDecimals = (d: number | null, symbol: string | null) => {
  if (!d) {
    return MIN_SWAP_AMOUNT;
  }

  return new Balance(Number(`0.${'0'.repeat(d! - 1)}1`), d, symbol!);
};

function getError(err: any): string {
  return typeof err === 'string'
    ? err
    : (err as any).message || (err as any).toString();
}

function findToken(wallet: string, token_address: string) {
  if (AddressUtils.equals(token_address, NATIVE_TOKEN_ADDRESS)) {
    return Token.generateNativeToken(Wallet.getById(wallet)!);
  }

  const tokenForWallet = Token.tokens?.[AddressUtils.toEth(wallet)]?.find(it =>
    AddressUtils.equals(it.id, token_address),
  );

  if (tokenForWallet) {
    return tokenForWallet;
  }

  const token = Token.data?.[AddressUtils.toEth(token_address)];

  if (!token) {
    return null;
  }

  return {
    ...token,
    value: new Balance(
      0,
      token.decimals! ?? Provider.selectedProvider.decimals,
      token.symbol! ?? Provider.selectedProvider.denom,
    ),
  } as IToken;
}

export const SwapScreen = observer(() => {
  const {animate} = useLayoutAnimation();
  const navigation = useTypedNavigation<SwapStackParamList>();
  const {params} = useTypedRoute<SwapStackParamList, SwapStackRoutes.Swap>();
  const [swapSettings, setSwapSettings] = useState<SwapTransactionSettings>(
    SWAP_SETTINGS_DEFAULT,
  );
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSwapInProgress, setSwapInProgress] = useState(false);
  const [isApproveInProgress, setApproveInProgress] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<SushiRoute | null>(null);
  const [poolsData, setPoolsData] = useState<PoolsData>({
    contracts: [],
    routes: [],
    pools: [],
  });
  const routesByToken0 = useRef<Record<AddressEthereum, SushiRoute[]>>({});
  const routesByToken1 = useRef<Record<AddressEthereum, SushiRoute[]>>({});

  const [estimateData, setEstimateData] = useState<
    Partial<SushiPoolEstimateResponse>
  >({});
  const [currentWallet, setCurrentWallet] = useState(
    Wallet.getById(params.address)!,
  );

  const estimateAbortController = useRef(new AbortController());
  const swapSettingsRef = useRef<SwapSettingBottomSheetRef>(null);

  const tokenIn = useMemo(
    () =>
      findToken(
        currentWallet.address,
        (currentRoute || poolsData.routes[0])?.token0!,
      ),
    [currentRoute, poolsData, currentWallet],
  );

  const tokenOut = useMemo(
    () =>
      findToken(
        currentWallet.address,
        (currentRoute || poolsData.routes[0])?.token1!,
      ),
    [currentRoute, poolsData, currentWallet],
  );

  const amountsOut = useSumAmount(
    undefined,
    undefined,
    undefined,
    (_: Balance) => '',
  );
  const amountsIn = useSumAmount(
    START_SWAP_AMOUNT,
    Wallet.getBalance(currentWallet.address, 'available'),
    MIN_SWAP_AMOUNT,
  );
  const minReceivedAmount = useMemo(() => {
    if (!estimateData.route || !tokenOut || !amountsOut.amount) {
      return new Balance(0, 0, tokenOut?.symbol!);
    }

    const slippage = new Decimal(swapSettings.slippage).div(100);
    const amountOut = new Decimal(amountsOut.amount);
    const result = amountOut
      .minus(amountOut.times(slippage))
      .times(new Decimal(10).pow(tokenOut.decimals!))
      .toString();
    return new Balance(result, tokenOut.decimals!, tokenOut.symbol!);
  }, [estimateData, tokenOut, swapSettings, amountsOut.amount]);

  const providerFee = useMemo(() => {
    const symbol = tokenIn?.symbol!;
    const decimals = tokenIn?.decimals!;
    if (!estimateData?.fee) {
      return new Balance(ZERO_HEX_NUMBER, decimals, symbol);
    }
    return new Balance(estimateData?.fee?.amount || '0', decimals, symbol);
  }, [tokenIn, estimateData]);
  const isLoading = useMemo(
    () => !poolsData?.routes?.length || !tokenIn || !tokenOut,
    [tokenIn, tokenOut, poolsData],
  );
  const isWrapTx = useMemo(
    () =>
      tokenIn?.symbol?.toLowerCase() ===
        Provider.selectedProvider.denom?.toLowerCase() &&
      tokenOut?.symbol?.toLowerCase() ===
        Provider.selectedProvider.config.wethSymbol?.toLowerCase(),
    [tokenIn, tokenOut, Provider.selectedProvider.denom],
  );
  const isUnwrapTx = useMemo(
    () =>
      tokenIn?.symbol?.toLowerCase() ===
        Provider.selectedProvider.config.wethSymbol?.toLowerCase() &&
      tokenOut?.symbol?.toLowerCase() ===
        Provider.selectedProvider.denom?.toLowerCase(),
    [tokenIn, tokenOut, Provider.selectedProvider.denom],
  );
  const t0Current = useMemo(() => {
    if (!amountsIn.amount || !tokenIn?.decimals) {
      return new Balance(0, tokenIn?.decimals!, tokenIn?.symbol!);
    }
    return new Balance(
      parseFloat(amountsIn.amount),
      tokenIn.decimals!,
      tokenIn.symbol!,
    );
  }, [amountsIn.amount, tokenIn]);

  const t1Current = useMemo(() => {
    if (!estimateData?.amount_out || !tokenOut?.decimals) {
      return new Balance(0, tokenOut?.decimals!, tokenOut?.symbol!);
    }
    return new Balance(
      estimateData?.amount_out,
      tokenOut.decimals!,
      tokenOut.symbol!,
    );
  }, [estimateData, tokenOut]);

  const t0Available = useMemo(() => {
    if (!tokenIn) {
      logger.log('t0 available: tokenIn is empty');
      return Balance.Empty;
    }

    if (tokenIn.value?.isPositive()) {
      return tokenIn.value;
    }

    if (tokenIn.symbol === Provider.selectedProvider.denom) {
      logger.log(`t0 available: currency ${Provider.selectedProvider.denom}`);
      return Wallet.getBalance(currentWallet.address, 'available');
    }

    const tokenData = Token.tokens?.[currentWallet.address]?.find(t =>
      AddressUtils.equals(t.id, tokenIn.id!),
    );
    if (tokenData) {
      logger.log('t0 available: tokenData', tokenData.value);
      return tokenData.value;
    }

    logger.log('t0 available: tokenData is empty, symbol: ', tokenIn.symbol);
    return new Balance(0, 0, tokenIn.symbol!);
  }, [currentWallet, tokenIn, Token.tokens, Provider.selectedProvider.denom]);

  const t1Available = useMemo(() => {
    if (!tokenOut) {
      return Balance.Empty;
    }

    if (tokenOut.value?.isPositive()) {
      return tokenOut.value;
    }

    if (tokenOut.symbol === Provider.selectedProvider.denom) {
      return Wallet.getBalance(currentWallet.address, 'available');
    }

    const tokenData = Token.tokens?.[currentWallet.address]?.find(t =>
      AddressUtils.equals(t.id, tokenOut.id!),
    );
    if (tokenData) {
      return tokenData.value;
    }

    return new Balance(0, 0, tokenOut.symbol!);
  }, [currentWallet, tokenOut, Provider.selectedProvider.denom, Token.tokens]);

  const rate = useMemo(() => {
    if (!amountsIn.amount || !amountsOut.amount || !tokenOut) {
      return '0';
    }

    const t0 = new Decimal(amountsIn.amount);
    const t1 = new Decimal(amountsOut.amount);
    const r = t1.div(t0);
    let result = '';

    if (r.lt(1)) {
      result = r.toFixed(LONG_NUM_PRECISION);
    } else {
      result = r.toFixed(NUM_PRECISION);
    }

    return result.concat(STRINGS.NBSP).concat(tokenOut.symbol!);
  }, [amountsIn.amount, amountsOut.amount, tokenOut]);

  const estimate = async (force = false) => {
    const errCtx: Record<string, any> = {};
    try {
      const currentAbortController = new AbortController();
      estimateAbortController.current?.abort();
      estimateAbortController.current = currentAbortController;

      logger.log('estimate token', {
        tokenOut,
        tokenIn,
        isEstimating,
        t0Current,
        t0Available,
      });

      if (!amountsIn.amount) {
        return;
      }

      if (/^0(\.)?(0+)?$/.test(amountsIn.amount)) {
        return;
      }

      setIsEstimating(true);

      if (t0Current?.compare?.('0x0', 'lte')) {
        vibrate(HapticEffects.impactLight);
        Keyboard.dismiss();
        return amountsOut.setAmount('0');
      }

      if (!Token.tokens?.[currentWallet.address]) {
        await Token.fetchTokens(true);
      }
      await refreshTokenBalances(currentWallet.address, t0Available);

      if (isWrapTx || isUnwrapTx) {
        amountsOut.setAmount(amountsIn.amount);
        if (currentAbortController.signal.aborted) {
          return;
        }
        return setEstimateData(() => ({
          allowance: '0x0',
          amount_in: t0Current.toHex(),
          amount_out: t0Current.toHex(),
          fee: {
            amount: '0',
            denom: Currencies.currency?.id!,
          },
          gas_estimate: '0x0',
          initialized_ticks_crossed_list: [0],
          need_approve: false,
          route: `${NATIVE_TOKEN_ADDRESS.slice(
            2,
          )}000000${NATIVE_TOKEN_ADDRESS.slice(2)}`,
          s_amount_in: t0Current.toFloatString(),
          s_assumed_amount_out: t0Current.toFloatString(),
          s_gas_spent: 0,
          s_price_impact: '0',
          s_primary_price: '0',
          s_swap_price: '0',
          sqrt_price_x96_after_list: [],
        }));
      }

      const request = {
        amount: t0Current.toHex(),
        sender: currentWallet.address,
        route: currentRoute?.route_hex!,
        currency_id: Currencies.currency?.id,
      };

      errCtx['⭕️sushi-pool-estimate-request'] = request;
      const response = await Indexer.instance.sushiPoolEstimate({
        ...request,
        abortSignal: estimateAbortController.current.signal,
      });
      errCtx['⭕️sushi-pool-estimate-response'] = response;

      if (tokenIn?.symbol === Provider.selectedProvider.denom) {
        response.need_approve = false;
      }

      logger.log('estimate resp', response);
      if (currentAbortController.signal.aborted) {
        return;
      }
      setEstimateData(() => response);

      const amountOut = new Balance(
        response.amount_out,
        tokenOut?.decimals!,
        tokenOut?.symbol!,
      );

      amountsOut.setAmount(
        amountOut.toBalanceString('auto', tokenOut?.decimals!, false, true),
      );
    } catch (err) {
      //@ts-ignore
      errCtx['⭕️estimate-error'] = err?.meta?.rawBody || err;
      if (err instanceof Error && err.name !== 'AbortError') {
        Logger.error(err, 'estimate', JSON.stringify(errCtx, null, 2));
        if (!force) {
          await estimate(true);
        } else {
          logger.captureException(err, 'estimate', errCtx);
          Alert.alert('estimate error', err?.message, [
            {
              text: 'Ok',
              onPress() {
                if (app.isTesterMode) {
                  Alert.alert(
                    'error context',
                    JSON.stringify(errCtx, null, 2),
                    [
                      {
                        text: 'Copy',
                        onPress() {
                          Clipboard.setString(JSON.stringify(errCtx, null, 2));
                        },
                      },
                      {
                        text: 'Cancel',
                      },
                    ],
                  );
                }
              },
            },
          ]);
        }
      }
    } finally {
      setIsEstimating(false);
    }
  };

  const awaitForToken = useCallback(
    async (initialValue: IToken) => {
      try {
        if (!Token.tokens?.[currentWallet.address]) {
          const hide = showModal(ModalType.loading, {
            text: 'Loading token balances',
          });
          try {
            await Token.fetchTokens(true);
          } catch {
          } finally {
            hide();
          }
        }

        const isToken0 = AddressUtils.equals(
          currentRoute?.token0!,
          initialValue.id!,
        );

        const tokens = poolsData.contracts
          .map(c => findToken(currentWallet.address, c.id!))
          .filter(Boolean) as IToken[];

        logger.log('tokens', tokens);

        const currentToken = {
          ...tokens.find(t => AddressUtils.equals(t.id, initialValue.id!))!,
          value: isToken0 ? t0Available : t1Available,
          tag: `${currentWallet.address}_${initialValue.id}` as AddressCosmosHaqq,
          id: initialValue.id,
        };

        const routes = isToken0
          ? routesByToken1.current[AddressUtils.toEth(initialValue.id!)]
          : routesByToken0.current[AddressUtils.toEth(initialValue.id!)];

        const possibleRoutesForSwap = routes
          .map(it => {
            const tokenAddress = isToken0 ? it.token0 : it.token1;

            const tokenContract = tokens.find(token =>
              AddressUtils.equals(token.id, tokenAddress),
            );

            if (tokenContract) {
              return {
                ...tokenContract,
                tag: `${currentWallet.address}_${tokenAddress}` as AddressCosmosHaqq,
                id: AddressUtils.toEth(tokenAddress),
              };
            }

            const contract =
              poolsData.contracts?.find(c =>
                AddressUtils.equals(c?.id!, isToken0 ? it.token0 : it.token1),
              ) ||
              Token.tokens?.[currentWallet.address]?.find(c =>
                AddressUtils.equals(c?.id!, isToken0 ? it.token0 : it.token1),
              );

            if (contract) {
              return {
                ...contract,
                tag: `${currentWallet.address}_${tokenAddress}` as AddressCosmosHaqq,
                image: contract.image,
                value: new Balance(0, 0, contract?.symbol!),
                id: AddressUtils.toEth(tokenAddress),
              } as unknown as IToken;
            }

            return undefined;
          })
          .filter(Boolean) as IToken[];

        const sortedTokens = [currentToken, ...possibleRoutesForSwap].sort(
          (a, b) => {
            // should be last if balance is 0
            if (!a?.value?.isPositive?.()) {
              return 1;
            }
            // should be last if balance is 0
            if (!b?.value?.isPositive?.()) {
              return -1;
            }

            const aValue = parseFloat(
              a.value.toBalanceString(
                LONG_NUM_PRECISION,
                undefined,
                false,
                true,
              ),
            );
            const bValue = parseFloat(
              b.value.toBalanceString(
                LONG_NUM_PRECISION,
                undefined,
                false,
                true,
              ),
            );
            if (aValue > bValue) {
              return -1;
            }
            if (aValue < bValue) {
              return 1;
            }
            return 0;
          },
        );

        const {value, index} = await awaitForValue({
          title: 'Select token',
          values: [
            {
              id: currentWallet.address,
              wallet: currentWallet,
              tokens: sortedTokens,
              title: currentWallet.name,
              subtitle: currentWallet.address,
            },
          ] as AwaitValue<{wallet: WalletModel; tokens: IToken[]}>[],
          closeOnSelect: true,
          renderCell: (
            // eslint-disable-next-line @typescript-eslint/no-shadow
            value: AwaitValue<{
              wallet: WalletModel;
              tokens: (IToken & {tag: string})[];
            }>,
            _,
            onPress,
          ) => {
            return (
              <View>
                <WalletCard
                  wallet={value.wallet}
                  tokens={value.tokens.map(t => {
                    if (t.symbol === Provider.selectedProvider.denom) {
                      return {
                        ...t,
                        value: Wallet.getBalance(
                          value?.wallet?.address,
                          'available',
                        ),
                      };
                    }

                    return {
                      ...t,
                      value:
                        tokens.find(c => c.id === t.tag?.split?.('_')[1])
                          ?.value ?? new Balance(0, 0, t?.symbol!),
                    };
                  })}
                  onPressToken={(w, newValue, idx) => {
                    logger.log('onPressToken', {wallet: w, newValue, value});
                    value.id = newValue.id;
                    onPress(value, idx);
                  }}
                  onPressWallet={w => {
                    logger.log('onPressWallet', {wallet: w, value});
                    value.id =
                      `${w.address}_${initialValue.id}` as AddressCosmosHaqq;
                    onPress(
                      value,
                      value.tokens.findIndex(
                        // @ts-ignore
                        t => t.id === initialValue.id,
                      ) || 0,
                    );
                  }}
                />
              </View>
            );
          },
        });

        const token = value?.tokens[index];
        const [walletAddres, tokenAddress] = token?.tag.split('_');
        const wallet = Wallet.getById(AddressUtils.toEth(walletAddres))!;
        const generatedISLMContract = {
          ...Token.generateNativeTokenContracts(),
          ...Token.generateNativeToken(wallet),
        };
        logger.log('awaitForToken', {
          walletAddres,
          tokenAddress,
          index,
          tokens: value.tokens,
        });
        const result = {
          wallet,
          token: (AddressUtils.equals(tokenAddress, generatedISLMContract.id)
            ? generatedISLMContract
            : value?.tokens?.[index]) as IToken & {value: Balance},
        };
        logger.log('awaitForToken', result);
        return result;
      } catch (err) {
        Logger.error('awaitForToken', err);
        logger.captureException(err, 'awaitForToken');
      }
    },
    [poolsData, setCurrentWallet, currentWallet],
  );

  const refreshTokenBalances = async (
    wallet = currentWallet.address,
    t0 = t0Available,
  ) => {
    if (!t0 || !wallet) {
      return {};
    }
    await Wallet.fetchBalances();

    const tokenValue =
      // @ts-ignore
      t0.value ||
      Token.tokens?.[wallet]?.find(t => AddressUtils.equals(t.id, tokenIn?.id!))
        ?.value;
    const availableIslm = Wallet.getBalance(wallet, 'available');

    const symbol = t0.getSymbol() || Provider.selectedProvider.denom;
    const isNativeCurrency = symbol === Provider.selectedProvider.denom;
    const decimals = t0.getPrecission() || Provider.selectedProvider.decimals;
    const zeroBalance = new Balance('0x0', decimals, symbol);
    const value = new Balance(
      (isNativeCurrency ? availableIslm : tokenValue) || zeroBalance,
      decimals,
      symbol,
    );
    const minAmount = value?.isPositive?.()
      ? getMinAmountForDecimals(decimals, symbol)
      : zeroBalance;

    if (minAmount?.compare?.('0x0', 'gte')) {
      amountsIn.setMinAmount(minAmount);
    }

    logger.log('value', value);
    if (value?.compare?.('0x0', 'gte')) {
      amountsIn.setMaxAmount(value);
    }
    return {value, minAmount};
  };

  const onPressChangeTokenIn = async () => {
    try {
      const {token} = (await awaitForToken(tokenIn!)) || {};
      if (!token || !tokenIn || !tokenOut) {
        return;
      }
      if (token.symbol === tokenIn.symbol) {
        return await estimate();
      }
      EventTracker.instance.trackEvent(MarketingEvents.swapSelectToken0, {
        token0_symbol: token.symbol!,
        token0_address: AddressUtils.toEth(token.id),
        chain_id: Provider.selectedProvider.ethChainId.toString(),
        wallet_address: currentWallet.address,
      });
      vibrate(HapticEffects.impactLight);
      Keyboard.dismiss();
      setIsEstimating(() => true);
      amountsOut.setAmount('');

      const needChangeTokenOut =
        AddressUtils.equals(token.id!, tokenOut?.id!) &&
        token.symbol === tokenOut.symbol;

      if (needChangeTokenOut) {
        return onPressChangeDirection();
      }

      const filteredRoutes = poolsData.routes.filter(r =>
        AddressUtils.equals(r.token0!, token?.id!),
      );
      const route = filteredRoutes.find(r =>
        AddressUtils.equals(r.token1!, tokenOut?.id!),
      );
      setCurrentRoute(route! || filteredRoutes[0]);

      await refreshTokenBalances(currentWallet?.address, t0Available);
      amountsIn.setAmount('');
      amountsIn.setError('');
      await estimate();
    } catch (err) {
      Logger.error(err, 'onPressChangeTokenIn');
      logger.captureException(err, 'onPressChangeTokenIn');
    } finally {
      setIsEstimating(() => false);
    }
  };

  const onPressChangeTokenOut = async () => {
    try {
      const {token} = (await awaitForToken(tokenOut!)) || {};
      if (!token || !tokenIn || !tokenOut) {
        return;
      }
      if (token.symbol === tokenOut.symbol) {
        return estimate();
      }
      EventTracker.instance.trackEvent(MarketingEvents.swapSelectToken1, {
        token1_symbol: token.symbol!,
        token1_address: AddressUtils.toEth(token.id),
        chain_id: Provider.selectedProvider.ethChainId.toString(),
        wallet_address: currentWallet.address,
      });
      vibrate(HapticEffects.impactLight);
      Keyboard.dismiss();
      amountsOut.setAmount('');
      setIsEstimating(() => true);

      const needChangeTokenIn =
        AddressUtils.equals(token.id!, tokenIn?.id!) &&
        token.symbol === tokenIn.symbol;

      if (needChangeTokenIn) {
        return onPressChangeDirection();
      }

      const filteredRoutes = poolsData.routes.filter(r =>
        AddressUtils.equals(r.token1!, token?.id!),
      );

      const route = filteredRoutes.find(r =>
        AddressUtils.equals(r.token0!, tokenIn?.id!),
      );
      setCurrentRoute(route! || filteredRoutes[0]);
      await refreshTokenBalances(currentWallet?.address, t0Available);
      return await estimate();
    } catch (err) {
      Logger.error(err, 'onPressChangeTokenOut');
      logger.captureException(err, 'onPressChangeTokenOut');
    } finally {
      setIsEstimating(() => false);
    }
  };

  const COMMON_EVENT_PARAMS = useMemo(
    () => ({
      // token0
      token0_symbol: tokenIn?.symbol!,
      token0_address: AddressUtils.toEth(tokenIn?.id!),
      token0_amount_text: amountsIn.amount,
      token0_amount_hex: estimateData?.amount_in!,
      token0_chain_id: Provider.selectedProvider.ethChainId.toString(), // TODO: for cross-chain swaps
      // token1
      token1_symbol: tokenOut?.symbol!,
      token1_address: AddressUtils.toEth(tokenOut?.id!),
      token1_amount_text: amountsOut.amount,
      token1_amount_hex: estimateData?.amount_out!,
      token1_chain_id: Provider.selectedProvider.ethChainId.toString(), // TODO: for cross-chain swaps
      // other
      chain_id: Provider.selectedProvider.ethChainId.toString(),
      wallet_address: currentWallet.address,
    }),
    [
      tokenIn?.symbol,
      tokenIn?.id,
      amountsIn.amount,
      estimateData?.amount_in,
      tokenOut?.symbol,
      tokenOut?.id,
      amountsOut.amount,
      estimateData?.amount_out,
      Provider.selectedProvider.ethChainId,
      currentWallet.address,
    ],
  );

  const onPressSwap = useCallback(async () => {
    try {
      EventTracker.instance.trackEvent(MarketingEvents.swapStart, {
        ...COMMON_EVENT_PARAMS,
        type: 'swap',
        swap_source: 'SwapRouterV3',
        swap_source_address: Provider.selectedProvider.config.swapRouterV3,
      });

      if (!estimateData?.route?.length) {
        return Alert.alert('Error', 'No swap route found');
      }
      setSwapInProgress(() => true);

      const swapRouter = new ethers.Contract(
        Provider.selectedProvider.config.swapRouterV3,
        V3SWAPROUTER_ABI,
      );

      const deadline =
        Math.floor(Date.now() / 1000) + 60 * parseFloat(swapSettings.deadline);

      const toke0IsNative = tokenIn?.symbol === Provider.selectedProvider.denom;
      const toke1IsNative =
        tokenOut?.symbol === Provider.selectedProvider.denom;

      const encodedPath = `0x${estimateData.route}`;
      const swapParams = [
        //  path
        encodedPath,
        // recipient
        currentWallet.address,
        //  deadline
        deadline,
        //  amountIn
        estimateData.amount_in,
        //  amountOutMinimum
        minReceivedAmount?.toHex() || 0,
      ];

      let txData = '';
      // if token1 is native, we need to unwrap it
      if (toke1IsNative) {
        // we need to change the recipient to the router address when use unwrapWETH9 inside multicall
        swapParams[1] = Provider.selectedProvider.config.swapRouterV3;
        const encodedSwapTxData = swapRouter.interface.encodeFunctionData(
          'exactInput',
          [swapParams],
        ) as string;
        const encodedUnwrap = swapRouter.interface.encodeFunctionData(
          'unwrapWETH9',
          [minReceivedAmount?.toHex() || 0, currentWallet.address],
        );

        txData = swapRouter.interface.encodeFunctionData('multicall', [
          [encodedSwapTxData, encodedUnwrap],
        ]) as string;
      } else {
        txData = swapRouter.interface.encodeFunctionData('exactInput', [
          swapParams,
        ]) as string;
      }

      const rawTx = await awaitForJsonRpcSign({
        metadata: HAQQ_METADATA,
        selectedAccount: currentWallet.address,
        chainId: Provider.selectedProvider.ethChainId,
        request: {
          method: 'eth_signTransaction',
          params: [
            {
              from: currentWallet.address,
              to: Provider.selectedProvider.config.swapRouterV3,
              value: toke0IsNative ? estimateData.amount_in : '0x0',
              data: txData,
            },
          ],
        },
      });

      const provider = await getRpcProvider(Provider.selectedProvider);
      const txHandler = await provider.sendTransaction(rawTx);
      const txResp = await txHandler.wait();

      navigation.navigate(SwapStackRoutes.Finish, {
        rate,
        amountIn: amountsIn.amount,
        amountOut: amountsOut.amount,
        txHash: txResp.transactionHash,
        token0: {...tokenIn!, value: t0Current},
        token1: {...tokenOut!, value: t1Current},
        isWrapTx,
        isUnwrapTx,
        estimateData: estimateData as SushiPoolEstimateResponse,
      });
      logger.log('txResp', txResp);
      EventTracker.instance.trackEvent(MarketingEvents.swapSuccess, {
        ...COMMON_EVENT_PARAMS,
        type: 'swap',
        swap_source: 'SwapRouterV3',
        swap_source_address: Provider.selectedProvider.config.swapRouterV3,
      });
      await estimate();
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert('Error', err.message);
      }
      logger.captureException(err, 'onPressSwap');
      EventTracker.instance.trackEvent(MarketingEvents.swapFail, {
        ...COMMON_EVENT_PARAMS,
        type: 'swap',
        swap_source: 'SwapRouterV3',
        swap_source_address: Provider.selectedProvider.config.swapRouterV3,
        error: getError(err),
      });
    } finally {
      setSwapInProgress(() => false);
    }
  }, [
    navigation,
    tokenOut,
    estimateData,
    tokenIn,
    currentWallet,
    estimate,
    amountsIn,
    swapSettings,
    minReceivedAmount,
    Provider.selectedProvider.denom,
    COMMON_EVENT_PARAMS,
    t0Current,
    t1Current,
    rate,
    amountsIn.amount,
    amountsOut.amount,
  ]);

  const onPressApprove = useCallback(async () => {
    try {
      EventTracker.instance.trackEvent(MarketingEvents.swapApproveStart, {
        ...COMMON_EVENT_PARAMS,
        type: 'approve',
        swap_source: 'SwapRouterV3',
        swap_source_address: Provider.selectedProvider.config.swapRouterV3,
      });
      setApproveInProgress(() => true);
      const provider = await getRpcProvider(Provider.selectedProvider);
      const erc20Token = new ethers.Contract(tokenIn?.id!, ERC20_ABI, provider);

      const amountBN = ethers.utils.parseUnits(
        amountsIn.amount,
        tokenIn?.decimals!,
      );

      const data = erc20Token.interface.encodeFunctionData('approve', [
        Provider.selectedProvider.config.swapRouterV3,
        amountBN._hex,
      ]);

      const rawTx = await awaitForJsonRpcSign({
        metadata: HAQQ_METADATA,
        selectedAccount: currentWallet.address,
        chainId: Provider.selectedProvider.ethChainId,
        request: {
          method: 'eth_signTransaction',
          params: [
            {
              from: currentWallet.address,
              to: AddressUtils.toEth(tokenIn?.id!),
              value: '0x0',
              data: data,
            },
          ],
        },
      });

      const txHandler = await provider.sendTransaction(rawTx);
      const txResp = await txHandler.wait();
      logger.log('txResp', txResp);
      EventTracker.instance.trackEvent(MarketingEvents.swapApproveSuccess, {
        ...COMMON_EVENT_PARAMS,
        type: 'approve',
        swap_source: 'SwapRouterV3',
        swap_source_address: Provider.selectedProvider.config.swapRouterV3,
      });
      vibrate(HapticEffects.success);
      Toast.show({
        type: 'success',
        text1: 'ERC20 Token Approved',
        text2: `for amount ${amountsIn.amount} ${tokenIn?.symbol}`,
        position: 'top',
        topOffset: 100,
      });
      await estimate();
      amountsIn.setError('');
    } catch (err) {
      logger.captureException(err, 'onPressApprove');
      EventTracker.instance.trackEvent(MarketingEvents.swapApproveFail, {
        ...COMMON_EVENT_PARAMS,
        type: 'approve',
        swap_source: 'SwapRouterV3',
        swap_source_address: Provider.selectedProvider.config.swapRouterV3,
        error: getError(err),
      });
    } finally {
      setApproveInProgress(() => false);
    }
  }, [
    amountsIn,
    tokenIn,
    tokenOut,
    currentWallet,
    estimate,
    COMMON_EVENT_PARAMS,
    t0Current,
    t1Current,
    rate,
    amountsIn.amount,
    amountsOut.amount,
  ]);

  const onPressWrap = useCallback(async () => {
    const swapSource =
      Token.getById(Provider.selectedProvider.config.wethAddress)?.name ||
      'WETH';

    // deposit
    try {
      EventTracker.instance.trackEvent(MarketingEvents.swapStart, {
        ...COMMON_EVENT_PARAMS,
        type: 'wrap',
        swap_source: swapSource,
        swap_source_address: Provider.selectedProvider.config.wethAddress,
      });
      setSwapInProgress(() => true);
      const provider = await getRpcProvider(Provider.selectedProvider);
      const WETH = new ethers.Contract(
        AddressUtils.toEth(Provider.selectedProvider.config.wethAddress),
        WETH_ABI,
        provider,
      );
      const txData = WETH.interface.encodeFunctionData('deposit');
      const rawTx = await awaitForJsonRpcSign({
        metadata: HAQQ_METADATA,
        selectedAccount: currentWallet.address,
        chainId: Provider.selectedProvider.ethChainId,
        request: {
          method: 'eth_signTransaction',
          params: [
            {
              from: currentWallet.address,
              to: AddressUtils.toEth(
                Provider.selectedProvider.config.wethAddress,
              ),
              value: t0Current.toHex(),
              data: txData,
            },
          ],
        },
      });

      const txHandler = await provider.sendTransaction(rawTx);
      const txResp = await txHandler.wait();

      navigation.navigate(SwapStackRoutes.Finish, {
        rate,
        amountIn: amountsIn.amount,
        amountOut: amountsOut.amount,
        txHash: txResp.transactionHash,
        token0: {...tokenIn!, value: t0Current},
        token1: {...tokenOut!, value: t1Current},
        estimateData: estimateData as SushiPoolEstimateResponse,
        isWrapTx,
        isUnwrapTx,
      });
      logger.log('txResp', txResp);
      EventTracker.instance.trackEvent(MarketingEvents.swapSuccess, {
        ...COMMON_EVENT_PARAMS,
        type: 'wrap',
        swap_source: swapSource,
        swap_source_address: Provider.selectedProvider.config.wethAddress,
      });
      await estimate();
    } catch (err) {
      Logger.error(err, 'deposit');
      logger.captureException(err, 'deposit');
      EventTracker.instance.trackEvent(MarketingEvents.swapFail, {
        ...COMMON_EVENT_PARAMS,
        type: 'wrap',
        swap_source: swapSource,
        swap_source_address: Provider.selectedProvider.config.wethAddress,
        error: getError(err),
      });
    } finally {
      setSwapInProgress(() => false);
    }
  }, [
    navigation,
    tokenIn,
    tokenOut,
    estimateData,
    currentWallet,
    estimate,
    amountsIn.amount,
    Provider.selectedProvider.denom,
    COMMON_EVENT_PARAMS,
    t0Current,
    t1Current,
    rate,
    amountsIn.amount,
    amountsOut.amount,
  ]);
  const onPressUnrap = useCallback(async () => {
    const swapSource =
      Token.getById(Provider.selectedProvider.config.wethAddress)?.name ||
      'WETH';
    // withdraw
    try {
      EventTracker.instance.trackEvent(MarketingEvents.swapStart, {
        ...COMMON_EVENT_PARAMS,
        type: 'unwrap',
        swap_source: swapSource,
        swap_source_address: Provider.selectedProvider.config.wethAddress,
      });
      setSwapInProgress(() => true);
      const provider = await getRpcProvider(Provider.selectedProvider);
      const WETH = new ethers.Contract(
        AddressUtils.toEth(Provider.selectedProvider.config.wethAddress),
        WETH_ABI,
        provider,
      );
      const amount = new Balance(
        parseFloat(amountsIn.amount),
        tokenIn?.decimals!,
        tokenIn?.symbol!,
      );
      const txData = WETH.interface.encodeFunctionData('withdraw', [
        amount.toHex(),
      ]);
      const rawTx = await awaitForJsonRpcSign({
        metadata: HAQQ_METADATA,
        selectedAccount: currentWallet.address,
        chainId: Provider.selectedProvider.ethChainId,
        request: {
          method: 'eth_signTransaction',
          params: [
            {
              from: currentWallet.address,
              to: AddressUtils.toEth(
                Provider.selectedProvider.config.wethAddress,
              ),
              value: '0x0',
              data: txData,
            },
          ],
        },
      });

      const txHandler = await provider.sendTransaction(rawTx);
      const txResp = await txHandler.wait();

      navigation.navigate(SwapStackRoutes.Finish, {
        txHash: txResp.transactionHash,
        token0: {...tokenIn!, value: t0Current},
        token1: {...tokenOut!, value: t1Current},
        estimateData: estimateData as SushiPoolEstimateResponse,
        isWrapTx,
        isUnwrapTx,
        rate,
        amountIn: amountsIn.amount,
        amountOut: amountsOut.amount,
      });
      logger.log('txResp', txResp);
      EventTracker.instance.trackEvent(MarketingEvents.swapSuccess, {
        ...COMMON_EVENT_PARAMS,
        type: 'unwrap',
        swap_source: swapSource,
        swap_source_address: Provider.selectedProvider.config.wethAddress,
      });
      await estimate();
    } catch (err) {
      Logger.error(err, 'withdraw');
      logger.captureException(err, 'withdraw');
      EventTracker.instance.trackEvent(MarketingEvents.swapFail, {
        ...COMMON_EVENT_PARAMS,
        type: 'unwrap',
        swap_source: swapSource,
        swap_source_address: Provider.selectedProvider.config.wethAddress,
        error: getError(err),
      });
    } finally {
      setSwapInProgress(() => false);
    }
  }, [
    navigation,
    tokenIn,
    tokenOut,
    estimateData,
    amountsIn.amount,
    tokenIn?.decimals,
    tokenIn?.symbol,
    currentWallet,
    estimate,
    Provider.selectedProvider.denom,
    COMMON_EVENT_PARAMS,
    amountsOut.amount,
    rate,
  ]);

  // 2. Ensure all callback functions are memoized with useCallback
  const onPressMax = useCallback(async () => {
    try {
      Keyboard.dismiss();
      vibrate(HapticEffects.impactLight);
      await refreshTokenBalances(currentWallet.address, t0Available);

      const maxAmount = t0Available.toBalanceString(
        'auto',
        t0Available.getPrecission(),
        false,
        true,
      );
      amountsIn.setAmount(maxAmount);
      await estimate();
      EventTracker.instance.trackEvent(MarketingEvents.swapPressMax, {
        max_amount: maxAmount,
        ...COMMON_EVENT_PARAMS,
      });
    } catch (error) {
      logger.error('onPressMax', error);
    }
  }, [
    refreshTokenBalances,
    currentWallet.address,
    t0Available,
    amountsIn,
    estimate,
    COMMON_EVENT_PARAMS,
  ]);

  const onPressChangeWallet = useCallback(async () => {
    const wallets = Wallet.getAll();
    const walletsWithBalances = Wallet.getAllPositiveBalance();

    const address = await awaitForWallet({
      title: I18N.selectAccount,
      wallets: walletsWithBalances?.length ? walletsWithBalances : wallets,
      initialAddress: currentWallet.address,
    });
    setCurrentWallet(() => Wallet.getById(address)!);
    await refreshTokenBalances(address as AddressEthereum);
    await estimate();
    amountsIn.setError('');
    navigation.setParams({
      address,
    });
  }, [currentWallet, refreshTokenBalances, tokenIn, navigation, estimate]);

  const onInputBlur = useCallback(async () => {
    if (!amountsIn.amount || !amountsIn.amountBalance?.isPositive()) {
      setEstimateData(() => ({}));
      amountsOut.setAmount('0');
      return amountsIn.setError('');
    }

    EventTracker.instance.trackEvent(
      MarketingEvents.swapEnterAmount,
      COMMON_EVENT_PARAMS,
    );
    vibrate(HapticEffects.impactLight);
    Keyboard.dismiss();
    setIsEstimating(() => true);
    await estimate();
  }, [estimate, setIsEstimating, COMMON_EVENT_PARAMS]);

  const onPressChangeDirection = useCallback(async () => {
    try {
      setIsEstimating(() => true);
      animate();
      setEstimateData(() => ({
        ...estimateData,
        amount_in: estimateData.amount_out,
        amount_out: estimateData.amount_in,
      }));
      amountsIn.setError('');
      amountsIn.setAmount(amountsOut.amount);
      amountsOut.setAmount(amountsIn.amount);
      const route = poolsData.routes.find(
        r =>
          AddressUtils.equals(r.token0, currentRoute?.token1!) &&
          AddressUtils.equals(r.token1, currentRoute?.token0!),
      )!;
      setCurrentRoute(() => route);

      EventTracker.instance.trackEvent(MarketingEvents.swapChangeDirection, {
        token0: route.token0,
        token1: route.token1,
        swap_path: route.route_hex,
      });

      await refreshTokenBalances();
      await estimate();
    } catch (error) {
      logger.error('onPressChangeDirection', error);
    } finally {
      setIsEstimating(() => false);
    }
  }, [
    amountsIn,
    amountsOut,
    estimateData,
    setEstimateData,
    currentRoute,
    setCurrentRoute,
    poolsData,
    estimate,
    refreshTokenBalances,
  ]);

  const onPressSettings = useCallback(async () => {
    vibrate(HapticEffects.impactLight);
    Keyboard.dismiss();
    swapSettingsRef?.current?.open?.();
  }, []);

  const onSwapSettingsChange = useCallback(
    (settings: SwapTransactionSettings) => {
      setSwapSettings(() => settings);
      estimate();
    },
    [setSwapSettings, estimate],
  );

  const prevTokenIn = usePrevious(tokenIn);
  const prevTokenOut = usePrevious(tokenOut);
  const prevCurrentWallet = usePrevious(currentWallet);
  const prevCurrentRoute = usePrevious(currentRoute);
  const prevAmountsIn = usePrevious(amountsIn.amount);

  useEffect(() => {
    if (
      currentRoute &&
      (prevTokenIn?.id !== tokenIn?.id ||
        prevTokenOut?.id !== tokenOut?.id ||
        prevCurrentWallet?.address !== currentWallet?.address ||
        prevCurrentRoute?.route_hex !== currentRoute?.route_hex ||
        prevAmountsIn !== amountsIn.amount)
    ) {
      logger.log('useEffect estimate()');
      refreshTokenBalances(currentWallet.address, t0Available).then(() =>
        estimate(),
      );
    }
  }, [
    tokenIn,
    tokenOut,
    currentWallet,
    currentRoute,
    prevTokenIn,
    prevTokenOut,
    prevCurrentWallet,
    prevCurrentRoute,
    amountsIn.amount,
    prevAmountsIn,
  ]);

  useEffect(() => {
    if (!Provider.selectedProvider.config.swapEnabled) {
      return navigation.goBack();
    }
    const fetchData = () => {
      Indexer.instance
        .sushiPools()
        .then(async data => {
          logger.log('data', data);
          await Token.fetchTokens(true);
          const tokens = Array.from(
            new Set([
              ...data.routes.map(r => r.token0),
              ...data.routes.map(r => r.token1),
            ]),
          )
            .map(token =>
              Token.tokens[currentWallet.address!].find(t =>
                AddressUtils.equals(t.id, token),
              ),
            )
            .concat(
              data.contracts.map(
                contract =>
                  ({
                    image: contract.icon!,
                    value: new Balance(0, contract.decimals!, contract.symbol!),
                    contract_created_at: contract.created_at!,
                    created_at: contract.created_at!,
                    contract_updated_at: contract.updated_at!,
                    updated_at: contract.updated_at!,
                    decimals: contract.decimals!,
                    name: contract.name!,
                    symbol: contract.symbol!,
                    id: contract.id!,
                    is_erc20: true,
                    is_erc1155: false,
                    is_erc721: false,
                    is_in_white_list: true,
                    chain_id: Provider.selectedProvider.ethChainId,
                  }) as IToken,
              ),
            )
            .concat([Token.generateNativeToken(currentWallet)!])
            .filter(Boolean) as IToken[];

          tokens.forEach(t => Token.create(t.id, t));

          setPoolsData(() => ({
            ...data,
            contracts: tokens,
          }));

          // setPoolsData(() => data);

          routesByToken0.current = {};
          routesByToken1.current = {};
          data.routes.forEach(route => {
            if (!routesByToken0.current[AddressUtils.toEth(route.token0)]) {
              routesByToken0.current[AddressUtils.toEth(route.token0)] = [];
            }
            routesByToken0.current[AddressUtils.toEth(route.token0)].push(
              route,
            );

            if (!routesByToken1.current[AddressUtils.toEth(route.token1)]) {
              routesByToken1.current[AddressUtils.toEth(route.token1)] = [];
            }
            routesByToken1.current[AddressUtils.toEth(route.token1)].push(
              route,
            );
          });

          const {swapDefaultToken0, swapDefaultToken1} =
            Provider.selectedProvider.config;
          logger.log('TOKEN 0', swapDefaultToken0);
          logger.log('TOKEN 1', swapDefaultToken1);

          setCurrentRoute(
            () =>
              data.routes.find(r => {
                // if swapDefaultToken1 is valid
                if (AddressUtils.isValidAddress(swapDefaultToken1)) {
                  return (
                    AddressUtils.equals(r.token0, swapDefaultToken0) &&
                    AddressUtils.equals(r.token1, swapDefaultToken1)
                  );
                }

                return AddressUtils.equals(r.token0, swapDefaultToken0);
              }) || data.routes[0],
          );
          if (!data.pools?.length || !data?.routes?.length) {
            showModal(ModalType.error, {
              title: getText(I18N.blockRequestErrorTitle),
              description: getText(I18N.noSwapRoutesFound),
              close: getText(I18N.pinErrorModalClose),
              async onClose() {
                navigation.goBack();
                const providersIDsPromises = await Promise.allSettled(
                  Provider.getAllEVM().map(async p => {
                    const indexer = new Indexer(p.ethChainId);
                    const config = await indexer.getProviderConfig();
                    if (config.swap_enabled) {
                      return p.id;
                    }
                    return null;
                  }),
                );

                const providersIDs = providersIDsPromises.map(promiseData => {
                  if (promiseData.status === 'fulfilled' && promiseData.value) {
                    return promiseData.value;
                  }
                  return null;
                });

                const providerId = await awaitForProvider({
                  providers: Provider.getAll().filter(p =>
                    providersIDs.includes(p.id!),
                  ),
                  initialProviderChainId: Provider.selectedProvider.ethChainId,
                  title: I18N.swapSupportedNetworks,
                });
                Provider.setSelectedProviderId(providerId);
              },
            });
          }
        })
        .catch(err => {
          logger.captureException(err, 'useFocusEffect:Indexer.sushiPools');
          setTimeout(fetchData, 1000);
        });
    };

    if (!poolsData?.contracts?.length || !poolsData?.routes?.length) {
      fetchData();
    }
  }, [poolsData]);

  useBackNavigationHandler(() => {
    EventTracker.instance.trackEvent(
      MarketingEvents.swapScreenClose,
      COMMON_EVENT_PARAMS,
    );
    Wallet.fetchBalances();
    Token.fetchTokens(true);
  }, [COMMON_EVENT_PARAMS]);

  useFocusEffect(
    useCallback(() => {
      EventTracker.instance.trackEvent(
        MarketingEvents.swapScreenOpen,
        COMMON_EVENT_PARAMS,
      );
    }, [COMMON_EVENT_PARAMS]),
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Swap
      rate={rate}
      currentWallet={currentWallet}
      poolData={poolsData!}
      isEstimating={isEstimating}
      tokenIn={tokenIn!}
      tokenOut={tokenOut!}
      amountsIn={amountsIn}
      amountsOut={amountsOut}
      estimateData={estimateData}
      isSwapInProgress={isSwapInProgress}
      isApproveInProgress={isApproveInProgress}
      t0Current={t0Current}
      t1Current={t1Current}
      t0Available={t0Available}
      t1Available={t1Available}
      isWrapTx={isWrapTx}
      isUnwrapTx={isUnwrapTx}
      providerFee={providerFee}
      swapSettingsRef={swapSettingsRef}
      swapSettings={swapSettings}
      minReceivedAmount={minReceivedAmount}
      currentRoute={currentRoute!}
      onSettingsChange={onSwapSettingsChange}
      onPressWrap={onPressWrap}
      onPressUnrap={onPressUnrap}
      onPressSwap={onPressSwap}
      onPressApprove={onPressApprove}
      onPressChangeTokenIn={onPressChangeTokenIn}
      onPressChangeTokenOut={onPressChangeTokenOut}
      onPressChangeWallet={onPressChangeWallet}
      onPressMax={onPressMax}
      onInputBlur={onInputBlur}
      onPressChangeDirection={onPressChangeDirection}
      onPressSettings={onPressSettings}
    />
  );
});
