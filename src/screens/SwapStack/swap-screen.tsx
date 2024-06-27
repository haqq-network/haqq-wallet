import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {ethers} from 'ethers';
import {toJS} from 'mobx';
import {observer} from 'mobx-react';
import {Alert, Keyboard, View} from 'react-native';
import Toast from 'react-native-toast-message';

import {
  SWAP_SETTINGS_DEFAULT,
  Swap,
  SwapSettingBottomSheetRef,
  SwapTransactionSettings,
} from '@app/components/swap';
import {Loading} from '@app/components/ui';
import {WalletCard} from '@app/components/ui/walletCard';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {awaitForWallet, showModal} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {awaitForJsonRpcSign} from '@app/helpers/await-for-json-rpc-sign';
import {AwaitValue, awaitForValue} from '@app/helpers/await-for-value';
import {getRpcProvider} from '@app/helpers/get-rpc-provider';
import {useSumAmount, useTypedRoute} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Contracts} from '@app/models/contracts';
import {Currencies} from '@app/models/currencies';
import {Token} from '@app/models/tokens';
import {Wallet} from '@app/models/wallet';
import {navigator} from '@app/navigator';
import {
  HomeStackRoutes,
  SwapStackParamList,
  SwapStackRoutes,
  TransactionStackRoutes,
} from '@app/route-types';
import {Balance} from '@app/services/balance';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {
  Indexer,
  SushiPoolEstimateResponse,
  SushiPoolResponse,
  SushiRoute,
} from '@app/services/indexer';
import {message} from '@app/services/toast';
import {
  HaqqCosmosAddress,
  HaqqEthereumAddress,
  IContract,
  IToken,
  ModalType,
} from '@app/types';
import {ERC20_ABI, V3SWAPROUTER_ABI, WETH_ABI} from '@app/variables/abi';
import {
  CURRENCY_NAME,
  HAQQ_METADATA,
  SUSHISWAP_MAINNET_ADDRESSES,
  WEI_PRECISION,
  WETH_MAINNET_ADDRESS,
} from '@app/variables/common';

const logger = Logger.create('SwapScreen', {
  emodjiPrefix: '🟠',
  stringifyJson: __DEV__,
});

const START_SWAP_AMOUNT = new Balance(0, 0);
const MIN_SWAP_AMOUNT = new Balance(0.0000001, 0);

const getMinAmountForDecimals = (d: number | null, symbol: string | null) => {
  if (!d) {
    return MIN_SWAP_AMOUNT;
  }
  const zero = Array.from({length: d - 1})
    .fill('0')
    .join('');
  const min = `0.${zero}1`;
  const amountBN = ethers.utils.parseUnits(min, d);
  return new Balance(amountBN, d, symbol || CURRENCY_NAME);
};

export const SwapScreen = observer(() => {
  const {params} = useTypedRoute<SwapStackParamList, SwapStackRoutes.Swap>();
  const [swapSettings, setSwapSettings] = useState<SwapTransactionSettings>(
    SWAP_SETTINGS_DEFAULT,
  );
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSwapInProgress, setSwapInProgress] = useState(false);
  const [isApproveInProgress, setApproveInProgress] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<SushiRoute | null>(null);
  const [poolsData, setPoolsData] = useState<SushiPoolResponse>({
    contracts: [],
    routes: [],
    pools: [],
  });
  const routesByToken0 = useRef<Record<HaqqCosmosAddress, SushiRoute[]>>({});
  const routesByToken1 = useRef<Record<HaqqCosmosAddress, SushiRoute[]>>({});

  const [estimateData, setEstimateData] =
    useState<SushiPoolEstimateResponse | null>(null);
  const [currentWallet, setCurrentWallet] = useState(
    Wallet.getById(params.address)!,
  );

  const estimateAbortController = useRef(new AbortController());
  const swapSettingsRef = useRef<SwapSettingBottomSheetRef>(null);

  const tokenIn = useMemo(
    () =>
      poolsData.contracts?.find?.(it =>
        AddressUtils.equals(
          it.eth_address!,
          (currentRoute || poolsData.routes[0])?.token0!,
        ),
      ) ||
      Contracts.getAll().find(it =>
        AddressUtils.equals(
          it.eth_address!,
          (currentRoute || poolsData.routes[0])?.token0!,
        ),
      ),
    [currentRoute, poolsData],
  );
  const tokenOut = useMemo(
    () =>
      poolsData.contracts?.find?.(it =>
        AddressUtils.equals(
          it.eth_address!,
          (currentRoute || poolsData.routes[0])?.token1!,
        ),
      ) ||
      Contracts.getAll().find(it =>
        AddressUtils.equals(
          it.eth_address!,
          (currentRoute || poolsData.routes[0])?.token1!,
        ),
      ),
    [currentRoute, poolsData, estimateData],
  );
  // logger.log('providerFee', {providerFee}, estimateData?.fee);
  // logger.log('tokenIn', tokenIn);
  // logger.log('tokenOut', tokenOut);
  // logger.log('currentRoute', currentRoute);
  // logger.log('poolsData.contracts', poolsData.contracts);
  const amountsOut = useSumAmount(
    undefined,
    undefined,
    undefined,
    (_: Balance) => '',
  );
  const amountsIn = useSumAmount(
    START_SWAP_AMOUNT,
    app.getAvailableBalance(currentWallet.address),
    MIN_SWAP_AMOUNT,
  );
  const minReceivedAmount = useMemo(() => {
    if (!estimateData || !tokenOut) {
      return new Balance(0, 0, tokenOut?.symbol!);
    }

    const slippage = parseFloat(swapSettings.slippage) / 100;
    const amountOut = parseFloat(amountsOut.amount);

    const result = (amountOut - amountOut * slippage).toString();
    return new Balance(result, 0, tokenOut.symbol!);
  }, [estimateData, tokenOut, swapSettings, amountsOut.amount]);

  const providerFee = useMemo(() => {
    const symbol = tokenIn?.symbol!;
    const decimals = tokenIn?.decimals!;
    if (!estimateData?.fee) {
      return new Balance(Balance.Empty, decimals, symbol);
    }
    return new Balance(estimateData?.fee.amount || '0', decimals, symbol);
  }, [tokenIn, estimateData]);
  const isLoading = useMemo(
    () =>
      !poolsData?.contracts?.length ||
      !poolsData?.routes?.length ||
      !tokenIn ||
      !tokenOut,
    [tokenIn, tokenOut, poolsData],
  );
  const isWrapTx = useMemo(
    () => tokenIn?.symbol === 'ISLM' && tokenOut?.symbol === 'wISLM',
    [tokenIn, tokenOut],
  );
  const isUnwrapTx = useMemo(
    () => tokenIn?.symbol === 'wISLM' && tokenOut?.symbol === 'ISLM',
    [tokenIn, tokenOut],
  );
  const t0Current = useMemo(() => {
    if (!amountsIn.amount || !tokenIn?.decimals) {
      return Balance.Empty;
    }
    return new Balance(
      parseFloat(amountsIn.amount),
      tokenIn.decimals!,
      tokenIn.symbol!,
    );
  }, [amountsIn.amount, tokenIn]);

  const t1Current = useMemo(() => {
    if (!estimateData?.amount_out || !tokenOut?.decimals) {
      return Balance.Empty;
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

    if (tokenIn.symbol === CURRENCY_NAME) {
      logger.log('t0 available: currency ISLM');
      return app.getAvailableBalance(currentWallet.address);
    }

    const tokenData = Token.tokens?.[currentWallet.address]?.find(t =>
      AddressUtils.equals(t.id, tokenIn.eth_address!),
    );
    if (tokenData) {
      logger.log('t0 available: tokenData', tokenData.value);
      return tokenData.value;
    }

    logger.log('t0 available: tokenData is empty, symbol: ', tokenIn.symbol);
    return new Balance(0, 0, tokenIn.symbol!);
  }, [currentWallet, tokenIn, Token.tokens]);

  const t1Available = useMemo(() => {
    if (!tokenOut) {
      return Balance.Empty;
    }

    if (tokenOut.symbol === CURRENCY_NAME) {
      return app.getAvailableBalance(currentWallet.address);
    }

    const tokenData = Token.tokens?.[currentWallet.address]?.find(t =>
      AddressUtils.equals(t.id, tokenOut.eth_address!),
    );
    if (tokenData) {
      return tokenData.value;
    }

    return new Balance(0, 0, tokenOut.symbol!);
  }, [currentWallet, tokenOut]);

  const estimate = async (force = false) => {
    try {
      estimateAbortController?.current?.abort();
      estimateAbortController.current = new AbortController();

      if (!amountsIn.amount) {
        return;
      }

      logger.log('estimate token', {
        // token,
        tokenOut,
        tokenIn,
        isEstimating,
        t0Current,
        t0Available,
      });

      setIsEstimating(true);
      setEstimateData(null);

      if (t0Current?.compare?.('0x0', 'lte')) {
        setEstimateData(null);
        vibrate(HapticEffects.impactLight);
        Keyboard.dismiss();
        return amountsOut.setAmount('0');
      }

      if (!Token.tokens?.[currentWallet.address]) {
        await Promise.all([
          Token.fetchTokens(true),
          awaitForEventDone(Events.onBalanceSync),
        ]);
      }
      await refreshTokenBalances(currentWallet.address, tokenIn);

      if (isWrapTx || isUnwrapTx) {
        amountsOut.setAmount(amountsIn.amount);
        return setEstimateData({
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
          route: '',
          s_amount_in: t0Current.toFloatString(),
          s_assumed_amount_out: t0Current.toFloatString(),
          s_gas_spent: 0,
          s_price_impact: '0',
          s_primary_price: '0',
          s_swap_price: '0',
          sqrt_price_x96_after_list: [],
        });
      }

      const response = await Indexer.instance.sushiPoolEstimate({
        amount: t0Current.toHex(),
        sender: currentWallet.address,
        // token_in: tokenIn?.eth_address!,
        // token_out: tokenOut?.eth_address!,
        route: currentRoute?.route_hex!,
        currency_id: Currencies.currency?.id,
        abortSignal: estimateAbortController.current.signal,
      });

      if (tokenIn?.symbol === CURRENCY_NAME) {
        response.need_approve = false;
      }
      response.s_price_impact = (
        parseFloat(response.s_price_impact) * 100
      ).toString();
      logger.log('estimate resp', response);
      setEstimateData(response);

      const amountOut = new Balance(
        response.amount_out,
        tokenOut?.decimals!,
        tokenOut?.symbol!,
      );

      amountsOut.setAmount(
        amountOut.toBalanceString('auto', tokenOut?.decimals!, false),
      );
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        Logger.error(err, 'estimate');
        logger.captureException(err, 'estimate');
        if (!force) {
          await estimate(true);
        } else {
          Alert.alert('estimate error', err?.message);
        }
      }
    } finally {
      setIsEstimating(false);
    }
  };

  const awaitForToken = useCallback(
    async (initialValue: IContract) => {
      try {
        logger.log('awaitForToken', Token.tokens);
        if (!Token.tokens?.[currentWallet.address]) {
          const hide = showModal(ModalType.loading, {
            text: 'Loading token balances',
          });
          try {
            await Promise.all([
              Token.fetchTokens(true),
              awaitForEventDone(Events.onBalanceSync),
            ]);
          } catch {
          } finally {
            hide();
          }
        }

        const isToken0 = AddressUtils.equals(
          currentRoute?.token0!,
          initialValue.eth_address!,
        );

        const routes = isToken0
          ? routesByToken1.current[
              AddressUtils.toHaqq(initialValue.eth_address!)
            ]
          : routesByToken0.current[
              AddressUtils.toHaqq(initialValue.eth_address!)
            ];

        const possibleRoutesForSwap = routes
          .map(it => {
            const tokenAddress = isToken0 ? it.token0 : it.token1;
            const tokens =
              Token.tokens[AddressUtils.toEth(currentWallet.address)] || [];
            const tokenContract = tokens.find(token =>
              AddressUtils.equals(token.id, tokenAddress),
            );

            if (tokenContract) {
              return {
                ...tokenContract,
                id: `${currentWallet.address}_${tokenAddress}` as HaqqCosmosAddress,
                eth_address: AddressUtils.toEth(tokenAddress),
              };
            }

            const contract =
              poolsData.contracts?.find(c =>
                AddressUtils.equals(
                  c?.eth_address!,
                  isToken0 ? it.token0 : it.token1,
                ),
              ) ||
              Contracts.getAll().find(c =>
                AddressUtils.equals(
                  c?.eth_address!,
                  isToken0 ? it.token0 : it.token1,
                ),
              );

            if (contract) {
              return {
                ...contract,
                id: `${currentWallet.address}_${tokenAddress}` as HaqqCosmosAddress,
                image: contract.icon,
                value: new Balance(0, 0, contract?.symbol!),
                eth_address: AddressUtils.toEth(tokenAddress),
              } as unknown as IToken;
            }

            return undefined;
          })
          .filter(Boolean) as IToken[];

        const {value, index} = await awaitForValue({
          title: 'Select token',
          values: [
            {
              id: currentWallet.address,
              wallet: currentWallet,
              tokens: possibleRoutesForSwap,
              title: currentWallet.name,
              subtitle: currentWallet.address,
            },
          ] as AwaitValue<{wallet: Wallet; tokens: IToken[]}>[],
          closeOnSelect: true,
          renderCell: (
            // eslint-disable-next-line @typescript-eslint/no-shadow
            value: AwaitValue<{wallet: Wallet; tokens: IToken[]}>,
            _,
            onPress,
          ) => {
            return (
              <View>
                <WalletCard
                  wallet={value.wallet}
                  tokens={value.tokens.map(t => {
                    if (t.symbol === 'ISLM') {
                      return {
                        ...t,
                        value: app.getAvailableBalance(value?.wallet?.address),
                      };
                    }

                    return {
                      ...t,
                      value:
                        Token.tokens[
                          AddressUtils.toEth(value?.wallet?.address)
                        ].find(c => c.id === t.id?.split?.('_')[1])?.value ??
                        new Balance(0, 0, t?.symbol!),
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
                      `${w.address}_${initialValue.id}` as HaqqCosmosAddress;
                    onPress(
                      value,
                      value.tokens.findIndex(
                        // @ts-ignore
                        t => t.eth_address === initialValue.eth_address,
                      ) || 0,
                    );
                  }}
                />
              </View>
            );
          },
        });

        const [walletAddres, tokenAddress] = value?.id.split('_');
        const wallet = Wallet.getById(AddressUtils.toEth(walletAddres))!;
        const generatedISLMContract = {
          ...Token.generateIslamicTokenContract(),
          ...Token.generateIslamicToken(wallet),
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
            : value?.tokens?.[index]) as IContract & {value: Balance},
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
    t0 = tokenIn,
  ) => {
    if (!t0 || !wallet) {
      return {};
    }

    const tokenValue =
      // @ts-ignore
      t0.value ||
      Token.tokens?.[wallet]?.find(t =>
        AddressUtils.equals(t.id, t0.eth_address!),
      )?.value;
    const availableIslm = app.getAvailableBalance(wallet);

    const symbol = t0.symbol || CURRENCY_NAME;
    const isNativeCurrency = symbol.toUpperCase() === CURRENCY_NAME;
    const decimals = t0.decimals || WEI_PRECISION;
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
      const {token, wallet} = (await awaitForToken(tokenIn!)) || {};
      if (!token || !wallet || !tokenIn || !tokenOut) {
        return;
      }
      vibrate(HapticEffects.impactLight);
      Keyboard.dismiss();
      setIsEstimating(() => true);
      amountsOut.setAmount('0');
      logger.log('onPressChangeTokenIn', token.symbol);
      if (wallet.address !== currentWallet.address) {
        setCurrentWallet(() => wallet);
      }
      logger.log('token', token);

      const needChangeTokenOut =
        AddressUtils.equals(token.eth_address!, tokenOut?.eth_address!) &&
        token.symbol === tokenOut.symbol;

      const filteredRoutes = poolsData.routes.filter(r =>
        AddressUtils.equals(r.token0!, token?.eth_address!),
      );
      if (needChangeTokenOut) {
        const route = filteredRoutes.find(r =>
          AddressUtils.equals(r.token1!, tokenIn?.eth_address!),
        );
        setCurrentRoute(route || filteredRoutes[0]);
      } else {
        const route = filteredRoutes.find(r =>
          AddressUtils.equals(r.token1!, tokenOut?.eth_address!),
        );
        setCurrentRoute(route! || filteredRoutes[0]);
      }
      await refreshTokenBalances(wallet.address, token);
      amountsIn.setMin();
      return await estimate();
    } catch (err) {
      Logger.error(err, 'onPressChangeTokenIn');
      logger.captureException(err, 'onPressChangeTokenIn');
    } finally {
      setIsEstimating(() => false);
    }
  };

  const onPressChangeTokenOut = async () => {
    try {
      const {token, wallet} = (await awaitForToken(tokenOut!)) || {};
      if (!token || !wallet || !tokenIn || !tokenOut) {
        return;
      }

      vibrate(HapticEffects.impactLight);
      Keyboard.dismiss();
      amountsOut.setAmount('0');
      setIsEstimating(() => true);
      setCurrentWallet(() => wallet);

      const needChangeTokenIn =
        AddressUtils.equals(token.eth_address!, tokenIn?.eth_address!) &&
        token.symbol === tokenIn.symbol;

      const filteredRoutes = poolsData.routes.filter(r =>
        AddressUtils.equals(r.token1!, token?.eth_address!),
      );

      if (needChangeTokenIn) {
        const route = filteredRoutes.find(r =>
          AddressUtils.equals(r.token0!, tokenOut?.eth_address!),
        );
        setCurrentRoute(route || filteredRoutes[0]);
      } else {
        const route = filteredRoutes.find(r =>
          AddressUtils.equals(r.token0!, tokenIn?.eth_address!),
        );
        setCurrentRoute(route! || filteredRoutes[0]);
      }
      await refreshTokenBalances(wallet.address, tokenIn);
      return await estimate();
    } catch (err) {
      Logger.error(err, 'onPressChangeTokenOut');
      logger.captureException(err, 'onPressChangeTokenOut');
    } finally {
      setIsEstimating(() => false);
    }
  };

  const onPressSwap = useCallback(async () => {
    try {
      setSwapInProgress(() => true);
      if (!estimateData?.route?.length) {
        return Alert.alert('Error', 'No swap route found');
      }
      setSwapInProgress(() => true);

      const swapRouter = new ethers.Contract(
        SUSHISWAP_MAINNET_ADDRESSES.SwapRouterV3,
        V3SWAPROUTER_ABI,
      );

      const deadline =
        Math.floor(Date.now() / 1000) + 60 * parseFloat(swapSettings.deadline);

      const tokenInIsISLM = tokenIn?.symbol === 'ISLM';

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

      logger.log({tokenIn});
      logger.log('swapParams', swapParams, {
        tokenInIsISLM,
      });

      const encodedTxData = swapRouter.interface.encodeFunctionData(
        'exactInput',
        [swapParams],
      ) as string;

      Logger.log('encodedTxData', encodedTxData);
      const rawTx = await awaitForJsonRpcSign({
        metadata: HAQQ_METADATA,
        selectedAccount: currentWallet.address,
        chainId: app.provider.ethChainId,
        request: {
          method: 'eth_signTransaction',
          params: [
            {
              from: currentWallet.address,
              to: SUSHISWAP_MAINNET_ADDRESSES.SwapRouterV3,
              value: tokenInIsISLM ? estimateData.amount_in : '0x0',
              data: encodedTxData,
            },
          ],
        },
      });

      const provider = await getRpcProvider(app.provider);
      const txHandler = await provider.sendTransaction(rawTx);
      const txResp = await txHandler.wait();
      navigator.goBack();
      navigator.navigate(HomeStackRoutes.Transaction, {
        // @ts-ignore
        screen: TransactionStackRoutes.TransactionFinish,
        params: {
          hash: txResp.transactionHash,
          hideContact: true,
          transaction: {
            ...txResp,
            hash: txResp.transactionHash,
          },
          token: toJS(
            tokenIn?.symbol === 'ISLM'
              ? Token.generateIslamicToken(currentWallet)
              : Token.tokens[currentWallet.address].find(t =>
                  AddressUtils.equals(t.id, tokenIn?.id!),
                ),
          ),
          amount: new Balance(
            parseFloat(amountsIn.amount),
            tokenIn?.decimals!,
            tokenIn?.symbol!,
          ),
        },
      });
      logger.log('txResp', txResp);
      await estimate();
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert('Error', err.message);
      }
      logger.captureException(err, 'onPressSwap');
    } finally {
      setSwapInProgress(() => false);
    }
  }, [
    estimateData,
    tokenIn,
    currentWallet,
    estimate,
    amountsIn,
    swapSettings,
    minReceivedAmount,
  ]);

  const onPressApprove = useCallback(async () => {
    try {
      setApproveInProgress(() => true);
      const provider = await getRpcProvider(app.provider);
      const erc20Token = new ethers.Contract(
        tokenIn?.eth_address!,
        ERC20_ABI,
        provider,
      );

      const amountBN = ethers.utils.parseUnits(
        amountsIn.amount,
        tokenIn?.decimals!,
      );

      const data = erc20Token.interface.encodeFunctionData('approve', [
        SUSHISWAP_MAINNET_ADDRESSES.SwapRouterV3,
        amountBN._hex,
      ]);

      const rawTx = await awaitForJsonRpcSign({
        metadata: HAQQ_METADATA,
        selectedAccount: currentWallet.address,
        chainId: app.provider.ethChainId,
        request: {
          method: 'eth_signTransaction',
          params: [
            {
              from: currentWallet.address,
              to: tokenIn?.eth_address,
              value: '0x0',
              data: data,
            },
          ],
        },
      });

      const txHandler = await provider.sendTransaction(rawTx);
      const txResp = await txHandler.wait();
      logger.log('txResp', txResp);
      vibrate(HapticEffects.success);
      Toast.show({
        type: 'success',
        text1: 'ERC20 Token Approved',
        text2: `for amount ${amountsIn.amount} ${tokenIn?.symbol}`,
        position: 'bottom',
        autoHide: false,
      });
      message(`${tokenIn?.symbol} approved for amount ${amountsIn.amount}`);
      await estimate();
    } catch (err) {
      logger.captureException(err, 'onPressApprove');
    } finally {
      setApproveInProgress(() => false);
    }
  }, [amountsIn, tokenIn, currentWallet, estimate]);

  const onPressWrap = useCallback(async () => {
    // deposit
    try {
      setSwapInProgress(() => true);
      const provider = await getRpcProvider(app.provider);
      const WETH = new ethers.Contract(
        WETH_MAINNET_ADDRESS,
        WETH_ABI,
        provider,
      );
      const txData = WETH.interface.encodeFunctionData('deposit');
      const rawTx = await awaitForJsonRpcSign({
        metadata: HAQQ_METADATA,
        selectedAccount: currentWallet.address,
        chainId: app.provider.ethChainId,
        request: {
          method: 'eth_signTransaction',
          params: [
            {
              from: currentWallet.address,
              to: WETH_MAINNET_ADDRESS,
              value: t0Current.toHex(),
              data: txData,
            },
          ],
        },
      });

      const txHandler = await provider.sendTransaction(rawTx);
      const txResp = await txHandler.wait();
      navigator.goBack();
      navigator.navigate(HomeStackRoutes.Transaction, {
        // @ts-ignore
        screen: TransactionStackRoutes.TransactionFinish,
        params: {
          hash: txResp.transactionHash,
          hideContact: true,
          transaction: {
            ...txResp,
            hash: txResp.transactionHash,
          },
          token: toJS(
            tokenIn?.symbol === 'ISLM'
              ? Token.generateIslamicToken(currentWallet)
              : Token.tokens[currentWallet.address].find(t =>
                  AddressUtils.equals(t.id, tokenIn?.id!),
                ),
          ),
          amount: new Balance(
            parseFloat(amountsIn.amount),
            tokenIn?.decimals!,
            tokenIn?.symbol!,
          ),
        },
      });
      logger.log('txResp', txResp);
      await estimate();
    } catch (err) {
      Logger.error(err, 'deposit');
      logger.captureException(err, 'deposit');
    } finally {
      setSwapInProgress(() => false);
    }
  }, [currentWallet, t0Current, estimate, amountsIn.amount]);
  const onPressUnrap = useCallback(async () => {
    // withdraw
    try {
      setSwapInProgress(() => true);
      const provider = await getRpcProvider(app.provider);
      const WETH = new ethers.Contract(
        WETH_MAINNET_ADDRESS,
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
        chainId: app.provider.ethChainId,
        request: {
          method: 'eth_signTransaction',
          params: [
            {
              from: currentWallet.address,
              to: WETH_MAINNET_ADDRESS,
              value: '0x0',
              data: txData,
            },
          ],
        },
      });

      const txHandler = await provider.sendTransaction(rawTx);
      const txResp = await txHandler.wait();
      navigator.goBack();
      navigator.navigate(HomeStackRoutes.Transaction, {
        // @ts-ignore
        screen: TransactionStackRoutes.TransactionFinish,
        params: {
          hash: txResp.transactionHash,
          hideContact: true,
          transaction: {
            ...txResp,
            hash: txResp.transactionHash,
          },
          token: toJS(
            tokenIn?.symbol === 'ISLM'
              ? Token.generateIslamicToken(currentWallet)
              : Token.tokens[currentWallet.address].find(t =>
                  AddressUtils.equals(t.id, tokenIn?.id!),
                ),
          ),
          amount: new Balance(
            parseFloat(amountsIn.amount),
            tokenIn?.decimals!,
            tokenIn?.symbol!,
          ),
        },
      });
      logger.log('txResp', txResp);
      await estimate();
    } catch (err) {
      Logger.error(err, 'withdraw');
      logger.captureException(err, 'withdraw');
    } finally {
      setSwapInProgress(() => false);
    }
  }, [
    amountsIn.amount,
    tokenIn?.decimals,
    tokenIn?.symbol,
    currentWallet,
    estimate,
  ]);

  const onPressMax = async () => {
    Keyboard.dismiss();
    vibrate(HapticEffects.impactLight);
    const {value} = await refreshTokenBalances(currentWallet.address, tokenIn);
    const balance = value || t0Available;
    amountsIn.setAmount(
      balance.toBalanceString('auto', tokenIn?.decimals!, false),
    );
    await estimate();
  };

  const onPressChangeWallet = useCallback(async () => {
    const wallets = Wallet.getAll();
    const walletsWithBalances = Wallet.getAllPositiveBalance();

    const address = await awaitForWallet({
      title: I18N.selectAccount,
      wallets: walletsWithBalances?.length ? walletsWithBalances : wallets,
      initialAddress: currentWallet.address,
    });
    await refreshTokenBalances(address as HaqqEthereumAddress, tokenIn);
    setCurrentWallet(() => Wallet.getById(address)!);
  }, [currentWallet, refreshTokenBalances, tokenIn]);

  const onInputBlur = useCallback(async () => {
    if (!amountsIn.amount) {
      setEstimateData(null);
      amountsOut.setAmount('0');
      return amountsIn.setError('');
    }
    vibrate(HapticEffects.impactLight);
    Keyboard.dismiss();
    setIsEstimating(() => true);
    await estimate();
  }, [estimate, setIsEstimating]);

  const onPressChangeDirection = useCallback(async () => {
    setCurrentRoute(
      () =>
        poolsData.routes.find(
          r =>
            AddressUtils.equals(r.token0, currentRoute?.token1!) &&
            AddressUtils.equals(r.token1, currentRoute?.token0!),
        )!,
    );
    await refreshTokenBalances();
    await estimate();
  }, [currentRoute, setCurrentRoute, poolsData]);

  const onPressSettings = useCallback(async () => {
    vibrate(HapticEffects.impactLight);
    Keyboard.dismiss();
    swapSettingsRef?.current?.open?.();
  }, []);

  useEffect(() => {
    if (currentRoute) {
      logger.log('useEffect estimate()');
      refreshTokenBalances(currentWallet.address, tokenIn).then(() =>
        estimate(),
      );
    }
  }, [tokenIn, tokenOut, currentWallet, currentRoute, amountsIn.amount]);

  useEffect(() => {
    const fetchData = () => {
      Indexer.instance
        .sushiPools()
        .then(async data => {
          const tokens = Array.from(
            new Set([
              ...data.routes.map(r => r.token0),
              ...data.routes.map(r => r.token1),
            ]),
          )
            .map(token => Contracts.getById(token))
            .filter(Boolean) as IContract[];

          setPoolsData(() => ({
            ...data,
            contracts: tokens,
          }));

          routesByToken0.current = {};
          routesByToken1.current = {};
          data.routes.forEach(route => {
            if (!routesByToken0.current[route.token0]) {
              routesByToken0.current[route.token0] = [];
            }
            routesByToken0.current[route.token0].push(route);

            if (!routesByToken1.current[route.token1]) {
              routesByToken1.current[route.token1] = [];
            }
            routesByToken1.current[route.token1].push(route);
          });
          setCurrentRoute(
            () =>
              data.routes.find(r =>
                AddressUtils.equals(r.token0, WETH_MAINNET_ADDRESS),
              ) || data.routes[1],
          );
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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Swap
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
      onSettingsChange={setSwapSettings}
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
