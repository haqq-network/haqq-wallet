import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {useFocusEffect} from '@react-navigation/native';
import {ethers} from 'ethers';
import {observer} from 'mobx-react';
import {Alert} from 'react-native';

import {Swap} from '@app/components/swap';
import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {AddressUtils} from '@app/helpers/address-utils';
import {awaitForJsonRpcSign} from '@app/helpers/await-for-json-rpc-sign';
import {awaitForValue} from '@app/helpers/await-for-value';
import {getRpcProvider} from '@app/helpers/get-rpc-provider';
import {useSumAmount, useTypedRoute} from '@app/hooks';
import {Currencies} from '@app/models/currencies';
import {SwapStackParamList, SwapStackRoutes} from '@app/route-types';
import {Balance} from '@app/services/balance';
import {
  Indexer,
  SushiPoolEstimateResponse,
  SushiPoolResponse,
} from '@app/services/indexer';
import {IContract} from '@app/types';
import {ERC20_ABI, V3SWAPROUTER_ABI} from '@app/variables/abi';
import {
  HAQQ_METADATA,
  SUSHISWAP_MAINNET_ADDRESSES,
  WETH_MAINNET_ADDRESS,
} from '@app/variables/common';

const logger = Logger.create('SwapScreen', {
  emodjiPrefix: '🟠',
  stringifyJson: __DEV__,
});

export const SwapScreen = observer(() => {
  const {params} = useTypedRoute<SwapStackParamList, SwapStackRoutes.Swap>();
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSwapInProgress, setSwapInProgress] = useState(false);
  const [isApproveInProgress, setApproveInProgress] = useState(false);
  const [tokenIn, setTokenIn] = useState<IContract | null>(null);
  const [tokenOut, setTokenOut] = useState<IContract | null>(null);
  const [estimateData, setEstimateData] =
    useState<SushiPoolEstimateResponse | null>(null);
  const amountsOut = useSumAmount(undefined, undefined, undefined, () => '');
  const amountsIn = useSumAmount(
    new Balance(1, 0),
    undefined,
    undefined,
    () => '',
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

  const estimate = useCallback(async () => {
    try {
      setIsEstimating(true);
      const amount = new Balance(
        parseFloat(amountsIn.amount),
        tokenIn?.decimals!,
        tokenIn?.symbol!,
      );
      logger.log('estimate', amount);
      const response = await Indexer.instance.sushiPoolEstimate({
        amount: amount.toHex(),
        sender: params.address,
        token_in: tokenIn?.eth_address!,
        token_out: tokenOut?.eth_address!,
        currency_id: Currencies.currency?.id,
      });

      logger.log('estimate', response);
      setEstimateData(response);
      const amountOut =
        parseInt(response.amount_out, 16) / Math.pow(10, tokenOut?.decimals!);
      amountsOut.setAmount(amountOut.toString());
    } catch (err) {
      logger.captureException(err, 'estimate');
    } finally {
      setIsEstimating(false);
    }
  }, [
    params,
    amountsIn,
    amountsOut,
    Currencies.currency,
    tokenIn,
    tokenOut,
    setEstimateData,
  ]);

  const awaitForToken = useCallback(
    async (initialValue: IContract) => {
      const token = await awaitForValue({
        title: 'Select token',
        values: poolsData.contracts.map(it => ({
          ...it,
          title: `${it.symbol} | ${it.name}`,
          subtitle: it.eth_address!,
        })),
        initialIndex: poolsData?.contracts.findIndex(
          it => it.eth_address === initialValue.eth_address,
        ),
      });

      logger.log('awaitForToken', token);
      return token;
    },
    [poolsData],
  );

  const onPressChangeTokenIn = useCallback(async () => {
    const token = await awaitForToken(tokenIn!);
    logger.log('onPressChangeTokenIn', token);
    setTokenIn(token);
  }, [awaitForToken, tokenIn]);

  const onPressChangeTokenOut = useCallback(async () => {
    const token = await awaitForToken(tokenOut!);
    logger.log('onPressChangeTokenOut', token);
    setTokenOut(token);
  }, [awaitForToken, tokenOut]);

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

      // TODO: разграничить нативный токен
      const tokenInIsISLM =
        tokenIn?.symbol === 'ISLM' || tokenIn?.symbol === 'wISLM';

      const encodedPath = `0x${estimateData.route}`;
      const swapParams = [
        //  path
        encodedPath,
        // recipient
        params.address,
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
        selectedAccount: params.address,
        chainId: app.provider.ethChainId,
        request: {
          method: 'eth_signTransaction',
          params: [
            {
              from: params.address,
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
  }, [amountsIn, estimateData, tokenIn, tokenOut, params.address, estimate]);

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
        selectedAccount: params.address,
        chainId: app.provider.ethChainId,
        request: {
          method: 'eth_signTransaction',
          params: [
            {
              from: params.address,
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
      await estimate();
    } catch (err) {
      logger.captureException(err, 'onPressApprove');
    } finally {
      setApproveInProgress(false);
    }
  }, [amountsIn, tokenIn, params.address, estimate]);

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
            const ISLM_CONTRACT_IDX = data.contracts.findIndex(it =>
              AddressUtils.equals(it.eth_address!, WETH_MAINNET_ADDRESS),
            );
            const RANDOM_CONTRACT =
              data.contracts[ISLM_CONTRACT_IDX - 1] ??
              data.contracts[ISLM_CONTRACT_IDX + 1];

            setPoolsData(data);
            setTokenIn(data.contracts[ISLM_CONTRACT_IDX]);
            setTokenOut(RANDOM_CONTRACT);
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
      poolData={poolsData!}
      isEstimating={isEstimating}
      tokenIn={tokenIn!}
      tokenOut={tokenOut!}
      amountsIn={amountsIn}
      amountsOut={amountsOut}
      estimateData={estimateData}
      isSwapInProgress={isSwapInProgress}
      isApproveInProgress={isApproveInProgress}
      onPressSwap={onPressSwap}
      onPressApprove={onPressApprove}
      onPressChangeTokenIn={onPressChangeTokenIn}
      onPressChangeTokenOut={onPressChangeTokenOut}
      estimate={estimate}
    />
  );
});
