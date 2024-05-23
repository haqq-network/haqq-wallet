import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {useFocusEffect} from '@react-navigation/native';
import {ethers} from 'ethers';
import {toJS} from 'mobx';
import {observer} from 'mobx-react';
import {Alert, Keyboard, View} from 'react-native';

import {Swap} from '@app/components/swap';
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
} from '@app/services/indexer';
import {message} from '@app/services/toast';
import {HaqqCosmosAddress, IContract, IToken, ModalType} from '@app/types';
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
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSwapInProgress, setSwapInProgress] = useState(false);
  const [isApproveInProgress, setApproveInProgress] = useState(false);
  const [tokenIn, setTokenIn] = useState<IContract | null>(null);
  const [tokenOut, setTokenOut] = useState<IContract | null>(null);
  const [currentWallet, setCurrentWallet] = useState(
    Wallet.getById(params.address)!,
  );
  const [estimateData, setEstimateData] =
    useState<SushiPoolEstimateResponse | null>(null);
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
  const [poolsData, setPoolsData] = useState<SushiPoolResponse>({
    contracts: [],
    pools: [],
  });
  const isLoading = useMemo(
    () =>
      !poolsData?.contracts?.length ||
      !poolsData?.pools?.length ||
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
    if (!amountsOut.amount || !tokenOut?.decimals) {
      return Balance.Empty;
    }
    return new Balance(
      parseFloat(amountsOut.amount),
      tokenOut.decimals!,
      tokenOut.symbol!,
    );
  }, [amountsOut.amount, tokenOut]);

  const t0Available = useMemo(() => {
    if (!tokenIn) {
      return Balance.Empty;
    }

    if (tokenIn.symbol === 'ISLM') {
      return app.getAvailableBalance(currentWallet.address);
    }

    const tokenData = Token.tokens?.[currentWallet.address]?.find(t =>
      AddressUtils.equals(t.id, tokenIn.eth_address!),
    );
    if (tokenData) {
      return tokenData.value;
    }

    return Balance.Empty;
  }, [currentWallet, tokenIn]);

  const t1Available = useMemo(() => {
    if (!tokenOut) {
      return Balance.Empty;
    }

    if (tokenOut.symbol === 'ISLM') {
      return app.getAvailableBalance(currentWallet.address);
    }

    const tokenData = Token.tokens?.[currentWallet.address]?.find(t =>
      AddressUtils.equals(t.id, tokenOut.eth_address!),
    );
    if (tokenData) {
      return tokenData.value;
    }

    return Balance.Empty;
  }, [currentWallet, tokenOut]);

  const estimate = useCallback(async () => {
    try {
      const amount = new Balance(
        parseFloat(amountsIn.amount),
        tokenIn?.decimals!,
        tokenIn?.symbol!,
      );

      if (!amount.isPositive()) {
        return;
      }

      setIsEstimating(true);
      await Promise.all([
        Token.fetchTokens(true, true),
        awaitForEventDone(Events.onBalanceSync),
      ]);

      if (isWrapTx || isUnwrapTx) {
        amountsOut.setAmount(amount.toFloatString());
        return setEstimateData({
          allowance: '0x0',
          amount_in: amount.toHex(),
          amount_out: amount.toHex(),
          fee: {
            amount: '0',
            denom: 'USD',
          },
          gas_estimate: '0x0',
          initialized_ticks_crossed_list: [0],
          need_approve: false,
          route: '',
          s_amount_in: amount.toFloatString(),
          s_assumed_amount_out: amount.toFloatString(),
          s_gas_spent: 0,
          s_price_impact: '0',
          s_primary_price: '0',
          s_swap_price: '0',
          sqrt_price_x96_after_list: [],
        });
      }

      logger.log('estimate', amount);
      const response = await Indexer.instance.sushiPoolEstimate({
        amount: amount.toHex(),
        sender: currentWallet.address,
        token_in: tokenIn?.eth_address!,
        token_out: tokenOut?.eth_address!,
        currency_id: Currencies.currency?.id,
      });

      if (tokenIn?.symbol === 'ISLM') {
        response.need_approve = false;
      }
      response.s_price_impact = (
        parseFloat(response.s_price_impact) * 100
      ).toString();
      logger.log('estimate', response);
      setEstimateData(response);
      const amountOut =
        parseInt(response.amount_out, 16) / Math.pow(10, tokenOut?.decimals!);
      amountsOut.setAmount(amountOut.toString());
    } catch (err) {
      // @ts-ignore
      message(`estimate error: ${err?.message}`);
      logger.captureException(err, 'estimate');
    } finally {
      setIsEstimating(false);
    }
  }, [
    params,
    amountsIn.amount,
    amountsOut,
    tokenIn,
    tokenOut,
    setEstimateData,
    isWrapTx,
    isUnwrapTx,
  ]);

  const awaitForToken = useCallback(
    async (initialValue: IContract) => {
      logger.log('awaitForToken', Token.tokens);
      const hide = showModal(ModalType.loading, {
        text: 'Loading token balances',
      });
      try {
        await Promise.all([
          Token.fetchTokens(true, true),
          awaitForEventDone(Events.onBalanceSync),
        ]);
      } catch {
      } finally {
        hide();
      }

      const values = Wallet.getAllVisible().map(it => ({
        id: it.address,
        wallet: it,
        tokens: poolsData?.contracts
          ?.map(
            c =>
              (Token.tokens[AddressUtils.toEth(it.address)]?.find(
                i => i.id === c.id,
              ) as IToken) ||
              ({
                ...c,
                image: c.icon,
                value: new Balance(0, 0, c?.symbol!),
              } as unknown as IToken),
          )
          .map(t => ({...t, id: `${it.address}_${t.id}` as HaqqCosmosAddress})),
        title: it.name,
        subtitle: it.address,
      })) as AwaitValue<{wallet: Wallet; tokens: IToken[]}>[];

      const {value} = await awaitForValue({
        title: 'Select token',
        values: values,
        closeOnSelect: true,
        renderCell: (
          // eslint-disable-next-line @typescript-eslint/no-shadow
          value: AwaitValue<{wallet: Wallet; tokens: IToken[]}>,
          checked,
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
                checkTokenSelected={(w, token) =>
                  w.address === currentWallet.address &&
                  token.id === initialValue.id
                }
                onPressToken={(w, newValue) => {
                  logger.log('onPressToken', {wallet: w, newValue, value});
                  value.id = newValue.id;
                  onPress(value);
                }}
                onPressWallet={w => {
                  logger.log('onPressWallet', {wallet: w, value});
                  value.id =
                    `${w.address}_${initialValue.id}` as HaqqCosmosAddress;
                  onPress(value);
                }}
              />
            </View>
          );
        },
      });

      const [walletAddres, tokenAddress] = value?.id.split('_');
      const result = {
        token:
          tokenAddress === WETH_MAINNET_ADDRESS
            ? Token.generateIslamicTokenContract()
            : Contracts.getById(AddressUtils.toHaqq(tokenAddress))!,
        wallet: Wallet.getById(AddressUtils.toEth(walletAddres))!,
      };
      logger.log('awaitForToken', result);
      return result;
    },
    [poolsData, setCurrentWallet, currentWallet],
  );

  const onPressChangeTokenIn = useCallback(async () => {
    const {token, wallet} = await awaitForToken(tokenIn!);
    setCurrentWallet(wallet);
    setTokenIn(token);

    if (token.eth_address === tokenOut?.eth_address) {
      setTokenOut(tokenIn);
    }

    if (token.symbol === 'ISLM') {
      const availableIslm = app.getAvailableBalance(currentWallet.address);
      const minAmount = getMinAmountForDecimals(WEI_PRECISION, CURRENCY_NAME);
      logger.log('ISLM', {minAmount, availableIslm});
      amountsIn.setMinAmount(minAmount);
      return amountsIn.setMaxAmount(availableIslm);
    }

    const tokenData = Token.tokens?.[currentWallet.address]?.find(t =>
      AddressUtils.equals(t.id, token.eth_address!),
    );
    if (tokenData) {
      const minAmount = getMinAmountForDecimals(token.decimals, token?.symbol!);
      amountsIn.setMinAmount(minAmount);
      amountsIn.setMaxAmount(tokenData.value);
    }
  }, [awaitForToken, tokenIn, tokenOut, amountsIn, currentWallet]);

  const onPressChangeTokenOut = useCallback(async () => {
    const {token, wallet} = await awaitForToken(tokenOut!);
    setTokenOut(token);
    setCurrentWallet(wallet);

    if (token.eth_address === tokenIn?.eth_address) {
      setTokenIn(tokenOut);
    }
  }, [awaitForToken, tokenOut, tokenIn]);

  const onPressSwap = useCallback(async () => {
    try {
      setSwapInProgress(true);
      if (!estimateData?.route?.length) {
        return Alert.alert('Error', 'No swap route found');
      }
      setSwapInProgress(true);

      const swapRouter = new ethers.Contract(
        SUSHISWAP_MAINNET_ADDRESSES.SwapRouterV3,
        V3SWAPROUTER_ABI,
      );

      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

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
        0,
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
          transaction: txResp,
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
      setSwapInProgress(false);
    }
  }, [estimateData, tokenIn, currentWallet, estimate, amountsIn]);

  const onPressApprove = useCallback(async () => {
    try {
      setApproveInProgress(true);
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
      Alert.alert(
        'Success',
        `${tokenIn?.symbol} approved for amount ${amountsIn.amount}`,
      );
      await estimate();
    } catch (err) {
      logger.captureException(err, 'onPressApprove');
    } finally {
      setApproveInProgress(false);
    }
  }, [amountsIn, tokenIn, currentWallet, estimate]);

  const onPressWrap = useCallback(async () => {
    // deposit
    try {
      setSwapInProgress(true);
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
          transaction: txResp,
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
      setSwapInProgress(false);
    }
  }, [currentWallet, t0Current, estimate, amountsIn.amount]);
  const onPressUnrap = useCallback(async () => {
    // withdraw
    try {
      setSwapInProgress(true);
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
          transaction: txResp,
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
      setSwapInProgress(false);
    }
  }, [
    amountsIn.amount,
    tokenIn?.decimals,
    tokenIn?.symbol,
    currentWallet,
    estimate,
  ]);

  const onPressMax = useCallback(async () => {
    vibrate(HapticEffects.impactLight);
    amountsIn.setMax();
    Keyboard.dismiss();
    await estimate();
  }, [amountsIn.setMax]);

  const onPressChangeWallet = useCallback(async () => {
    const address = await awaitForWallet({
      title: I18N.selectAccount,
      wallets: Wallet.getAllVisible(),
      initialAddress: currentWallet.address,
    });

    setCurrentWallet(Wallet.getById(address)!);
  }, [currentWallet]);

  useEffect(() => {
    if (tokenIn && tokenOut && !isEstimating) {
      logger.log('useEffect estimate()');
      estimate();
    }
  }, [tokenIn, tokenOut]);

  useFocusEffect(
    useCallback(() => {
      if (!poolsData.contracts.length && !poolsData.pools.length) {
        logger.log('useFocusEffect');
        Indexer.instance
          .sushiPools()
          .then(async data => {
            data.contracts.unshift(Token.generateIslamicTokenContract());
            setPoolsData(data);
            setTokenIn(data.contracts[0]);
            setTokenOut(data.contracts[1]);
          })
          .catch(err =>
            logger.captureException(err, 'useFocusEffect:Indexer.sushiPools'),
          );
      }
    }, [setTokenIn, setTokenOut, poolsData]),
  );

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
      onPressWrap={onPressWrap}
      onPressUnrap={onPressUnrap}
      onPressSwap={onPressSwap}
      onPressApprove={onPressApprove}
      onPressChangeTokenIn={onPressChangeTokenIn}
      onPressChangeTokenOut={onPressChangeTokenOut}
      estimate={estimate}
      onPressChangeWallet={onPressChangeWallet}
      onPressMax={onPressMax}
    />
  );
});

// const styles = createTheme({
//   nftViewerContainer: {
//     marginHorizontal: 20,
//   },
// });
