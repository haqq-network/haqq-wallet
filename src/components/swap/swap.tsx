import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {useIsFocused} from '@react-navigation/native';
import BigNumber from 'bignumber.js';
import {ethers} from 'ethers';
import {observer} from 'mobx-react';
import {Alert, View} from 'react-native';
import Toast from 'react-native-toast-message';

import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {awaitForJsonRpcSign} from '@app/helpers/await-for-json-rpc-sign';
import {AwaitValue, awaitForValue} from '@app/helpers/await-for-value';
import {getRpcProvider} from '@app/helpers/get-rpc-provider';
import {useSumAmount, useTypedRoute} from '@app/hooks';
import {I18N} from '@app/i18n';
import {SwapStackParamList, SwapStackRoutes} from '@app/route-types';
import {Balance} from '@app/services/balance';
import {sleep} from '@app/utils';
import {ERC20_ABI, QUOTERV2_ABI, V3SWAPROUTER_ABI} from '@app/variables/abi';
import {
  HAQQ_METADATA,
  SUSHISWAP_MAINNET_ADDRESSES,
} from '@app/variables/common';

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

type IToken = {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
};

const TOKENS = [
  {
    address: '0xeC8CC083787c6e5218D86f9FF5f28d4cC377Ac54',
    symbol: 'ISLM', // Wrapped ISLM,
    name: 'Wrapped Islamic Coin',
    decimals: 18,
  },
  {
    address: '0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd',
    symbol: 'axlUSDC',
    name: 'Axelar Wrapped USD Coin',
    decimals: 6,
  },
  {
    address: '0xC5e00D3b04563950941f7137B5AfA3a534F0D6d6',
    symbol: 'axlDAI',
    name: 'Axelar Wrapped DAI',
    decimals: 18,
  },
  {
    address: '0xc03345448969Dd8C00e9E4A85d2d9722d093aF8E',
    symbol: 'OSMO',
    name: 'Native token Osmosis network',
    decimals: 6,
  },
  {
    address: '0xd567B3d7B8FE3C79a1AD8dA978812cfC4Fa05e75',
    symbol: 'axlUSDT',
    name: 'Axelar Wrapped Tether USD',
    decimals: 6,
  },
  {
    address: '0xFA3C22C069B9556A4B2f7EcE1Ee3B467909f4864',
    symbol: 'ATOM',
    name: 'Native token CosmosHub network',
    decimals: 6,
  },
  {
    address: '0x5FD55A1B9FC24967C4dB09C513C3BA0DFa7FF687',
    symbol: 'axlWBTC',
    name: 'Axelar Wrapped BTC',
    decimals: 8,
  },
  {
    address: '0xecEEEfCEE421D8062EF8d6b4D814efe4dc898265',
    symbol: 'axlWETH',
    name: 'Axelar Wrapped Ether',
    decimals: 18,
  },
].map(
  item =>
    ({
      ...item,
      id: item.address,
      title: item.symbol,
      subtitle: item.address,
    }) as IToken & AwaitValue,
);

type IPool = {
  address: string;
  name: string;
  swapFee: number;
  token0: IToken;
  token1: IToken;
};

const POOLS: IPool[] = [
  {
    address: '0x6766f7852b63187a2054eda1fa60cc0b2e2ee930',
    name: 'axlUSDC-WISLM',
    swapFee: 3000,
    token0: {
      address: '0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd',
      name: 'Axelar Wrapped USD Coin',
      symbol: 'axlUSDC',
      decimals: 6,
    },
    token1: {
      address: '0xeC8CC083787c6e5218D86f9FF5f28d4cC377Ac54',
      name: 'Wrapped Islamic Coin',
      symbol: 'WISLM',
      decimals: 18,
    },
  },
  {
    address: '0x29fa8d94c2f097de0b17d1c414398d2f931de78c',
    name: 'WISLM-axlWETH',
    swapFee: 3000,
    token0: {
      address: '0xeC8CC083787c6e5218D86f9FF5f28d4cC377Ac54',
      name: 'Wrapped Islamic Coin',
      symbol: 'WISLM',
      decimals: 18,
    },
    token1: {
      address: '0xecEEEfCEE421D8062EF8d6b4D814efe4dc898265',
      name: 'Axelar Wrapped Ether',
      symbol: 'axlETH',
      decimals: 18,
    },
  },
  {
    address: '0x45c0f78ab0eb913f11507339185891acde155d0f',
    name: 'axlUSDT-WISLM',
    swapFee: 3000,
    token0: {
      address: '0xd567B3d7B8FE3C79a1AD8dA978812cfC4Fa05e75',
      name: 'Axelar Wrapped Tether USD',
      symbol: 'axlUSDT',
      decimals: 6,
    },
    token1: {
      address: '0xeC8CC083787c6e5218D86f9FF5f28d4cC377Ac54',
      name: 'Wrapped Islamic Coin',
      symbol: 'WISLM',
      decimals: 18,
    },
  },
  {
    address: '0xc91970a1bae0348a301b780d4aeb52dd260e0ca5',
    name: 'axlDAI-WISLM',
    swapFee: 3000,
    token0: {
      address: '0xC5e00D3b04563950941f7137B5AfA3a534F0D6d6',
      name: 'Axelar Wrapped DAI',
      symbol: 'axlDAI',
      decimals: 18,
    },
    token1: {
      address: '0xeC8CC083787c6e5218D86f9FF5f28d4cC377Ac54',
      name: 'Wrapped Islamic Coin',
      symbol: 'WISLM',
      decimals: 18,
    },
  },
  {
    address: '0xf3a9f274e38911b18483a205479e0499c4e35c3e',
    name: 'axlWBTC-WISLM',
    swapFee: 3000,
    token0: {
      address: '0x5FD55A1B9FC24967C4dB09C513C3BA0DFa7FF687',
      name: 'Axelar Wrapped BTC',
      symbol: 'axlWBTC',
      decimals: 8,
    },
    token1: {
      address: '0xeC8CC083787c6e5218D86f9FF5f28d4cC377Ac54',
      name: 'Wrapped Islamic Coin',
      symbol: 'WISLM',
      decimals: 18,
    },
  },
  {
    address: '0x95aab03244692a6f889fbcc8575c74ce0df38c2a',
    name: 'WISLM-ATOM',
    swapFee: 3000,
    token0: {
      address: '0xeC8CC083787c6e5218D86f9FF5f28d4cC377Ac54',
      name: 'Wrapped Islamic Coin',
      symbol: 'WISLM',
      decimals: 18,
    },
    token1: {
      address: '0xFA3C22C069B9556A4B2f7EcE1Ee3B467909f4864',
      name: 'Native token CosmosHub network',
      symbol: 'ATOM',
      decimals: 6,
    },
  },
  {
    address: '0xd9c0714ce6a323ec57f72e24da950650f50ee517',
    name: 'OSMO-WISLM',
    swapFee: 3000,
    token0: {
      address: '0xc03345448969Dd8C00e9E4A85d2d9722d093aF8E',
      name: 'Native token Osmosis network',
      symbol: 'OSMO',
      decimals: 6,
    },
    token1: {
      address: '0xeC8CC083787c6e5218D86f9FF5f28d4cC377Ac54',
      name: 'Wrapped Islamic Coin',
      symbol: 'WISLM',
      decimals: 18,
    },
  },
  {
    address: '0x2f7fe75b01e689478673fb3d65fd130639ea4321',
    name: 'axlUSDC-axlWETH',
    swapFee: 3000,
    token0: {
      address: '0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd',
      name: 'Axelar Wrapped USD Coin',
      symbol: 'axlUSDC',
      decimals: 6,
    },
    token1: {
      address: '0xecEEEfCEE421D8062EF8d6b4D814efe4dc898265',
      name: 'Axelar Wrapped Ether',
      symbol: 'axlETH',
      decimals: 18,
    },
  },
];

export function sqrtToPrice(
  sqrt: BigNumber,
  decimals0: number,
  decimals1: number,
  token0IsInput = false,
) {
  const numerator = sqrt.pow(2);
  const denominator = 2 ** 192;
  const shiftDecimals = Math.pow(10, decimals0 - decimals1);
  const ratio = numerator.div(denominator).multipliedBy(shiftDecimals);

  if (!token0IsInput) {
    return new BigNumber(1).div(ratio);
  }

  return ratio;
}

function findTokenSwapPath(
  tokenInAddress: string,
  tokenOutAddress: string,
): IPool[] {
  // Создаем граф связей между токенами
  const graph: Record<string, Record<string, IPool>> = {};

  // Инициализация графа с вершинами для каждого токена
  POOLS.forEach(pool => {
    const {token0, token1} = pool;

    if (!graph[token0.address]) {
      graph[token0.address] = {};
    }
    if (!graph[token1.address]) {
      graph[token1.address] = {};
    }

    // Двунаправленные связи, т.к. обмен возможен в обе стороны
    graph[token0.address][token1.address] = pool;
    graph[token1.address][token0.address] = pool;
  });

  // Алгоритм поиска в ширину (BFS) для нахождения пути
  let queue = [[tokenInAddress]]; // начинаем с адреса tokenIn
  let visited = new Set([tokenInAddress]);

  while (queue.length > 0) {
    const path = queue.shift() as string[]; // извлекаем первый путь из очереди
    const node = path[path.length - 1]; // последний узел в текущем пути

    if (node === tokenOutAddress) {
      // Если достигли tokenOut, возвращаем этот путь
      return path
        .map((address, index) => {
          if (index < path.length - 1) {
            // Возвращаем пул, соответствующий переходу между токенами
            return graph[address][path[index + 1]];
          }
          return null;
        })
        .filter(Boolean) as IPool[];
    }

    // Перебор всех соседних узлов
    for (let adjacent in graph[node]) {
      if (!visited.has(adjacent)) {
        visited.add(adjacent); // отмечаем узел как посещенный
        queue.push([...path, adjacent]); // добавляем новый путь в очередь
      }
    }
  }

  return []; // Если путь не найден, возвращаем пустой массив
}

function encodeSwapPathWithDirection(
  pools: IPool[],
  tokenIn: string,
  tokenOut: string,
) {
  if (pools.length === 0) {
    throw new Error('The pools array must not be empty');
  }

  // Проверяем, что токен входа совпадает с первым токеном в первом пуле
  let path = ethers.utils.hexlify(ethers.utils.arrayify(tokenIn));

  pools.forEach((pool, index) => {
    const isToken0 =
      pool.token0.address.toLowerCase() === tokenIn.toLowerCase();
    const nextToken = isToken0 ? pool.token1.address : pool.token0.address;

    // Проверяем, что цепочка токенов корректна
    if (
      tokenIn.toLowerCase() !==
      (isToken0
        ? pool.token0.address.toLowerCase()
        : pool.token1.address.toLowerCase())
    ) {
      throw new Error(`Token mismatch at pool index ${index}`);
    }

    // Комиссия пула
    const feeHex = ethers.utils.hexZeroPad(
      ethers.utils.hexlify(pool.swapFee),
      3,
    );
    path += feeHex.slice(2); // добавляем комиссию без "0x"
    path += ethers.utils.hexStripZeros(nextToken).slice(2); // добавляем адрес следующего токена без "0x"

    // Обновляем токен входа для следующего пула
    tokenIn = nextToken;
  });

  // Проверяем, что последний токен в пути соответствует ожидаемому токену на выходе
  if (tokenIn.toLowerCase() !== tokenOut.toLowerCase()) {
    throw new Error(
      'The final token in the path does not match the expected output token',
    );
  }

  return path;
}

export const Swap = observer(() => {
  const [tokenIn, setTokenIn] = React.useState(TOKENS[0]);
  const [tokenOut, setTokenOut] = React.useState(TOKENS[1]);
  const amountsIn = useSumAmount(
    new Balance(1, 0),
    undefined,
    undefined,
    () => '',
  );
  const amountsOut = useSumAmount(undefined, undefined, undefined, () => '');

  const [isSwapInProgress, setSwapInProgress] = useState(false);
  const [isApproveInProgress, setApproveInProgress] = useState(false);
  const [isQuoterProcess, setQuoterProcess] = useState(false);
  const isQuoterProcessRef = useRef(false);
  const [needApproveTokenIn, setNeedApproveTokenIn] = useState(false);
  const isFocused = useIsFocused();
  const isLoading = !amountsOut.amount || isQuoterProcess;
  const [priceImpact, setPriceImpact] = useState<BigNumber>();

  const {
    params: {address},
  } = useTypedRoute<SwapStackParamList, SwapStackRoutes.Swap>();

  const swapRoutePath = useMemo(
    () => findTokenSwapPath(tokenIn.address, tokenOut.address),
    [tokenIn, tokenOut],
  );

  const onPressApprove = useCallback(async () => {
    try {
      setApproveInProgress(true);
      const provider = await getRpcProvider(app.provider);
      const erc20Token = new ethers.Contract(
        tokenIn.address,
        ERC20_ABI,
        provider,
      );

      const amountBN = ethers.utils.parseUnits(
        amountsIn.amount,
        tokenIn.decimals,
      );

      const data = erc20Token.interface.encodeFunctionData('approve', [
        SUSHISWAP_MAINNET_ADDRESSES.SwapRouterV3,
        amountBN._hex,
      ]);

      const rawTx = await awaitForJsonRpcSign({
        metadata: HAQQ_METADATA,
        selectedAccount: address,
        chainId: app.provider.ethChainId,
        request: {
          method: 'eth_signTransaction',
          params: [
            {
              from: address,
              to: tokenIn.address,
              value: '0x0',
              data: data,
            },
          ],
        },
      });

      const txHandler = await provider.sendTransaction(rawTx);
      const txResp = await txHandler.wait();
      Logger.log('txResp', txResp);
      await quoteSwapTransaction();
    } catch (err) {
      Logger.error('approve', err);
    } finally {
      setApproveInProgress(false);
    }
  }, [tokenIn, amountsIn.amount]);

  const checkAllowance = useCallback(async () => {
    try {
      const tokenInIsISLM = tokenIn.symbol === 'ISLM';
      if (tokenInIsISLM) {
        setNeedApproveTokenIn(false);
        return true;
      }
      const provider = await getRpcProvider(app.provider);
      const erc20Token = new ethers.Contract(
        tokenIn.address,
        ERC20_ABI,
        provider,
      );
      const allowAmout: BigNumber = await erc20Token.callStatic.allowance(
        address,
        SUSHISWAP_MAINNET_ADDRESSES.SwapRouterV3,
      );

      Logger.log('allowAmout raw', allowAmout);
      Logger.log('allowAmout', allowAmout.toNumber());
      if (allowAmout.toNumber() / 10 ** tokenIn.decimals < +amountsIn.amount) {
        setNeedApproveTokenIn(true);
        return false;
      }

      setNeedApproveTokenIn(false);
      return true;
    } catch (err) {
      Logger.log('checkAllowance', err);
    }
  }, [address, tokenIn, amountsIn.amount]);

  const quoteSwapTransaction = useCallback(async () => {
    try {
      if (!isFocused || isQuoterProcess || isQuoterProcessRef.current) {
        return;
      }
      setQuoterProcess(true);
      isQuoterProcessRef.current = true;
      if (!swapRoutePath || swapRoutePath.length === 0) {
        return Alert.alert('Error', 'No swap route found');
      }
      await checkAllowance();
      const provider = await getRpcProvider(app.provider);
      const quoter = new ethers.Contract(
        SUSHISWAP_MAINNET_ADDRESSES.QuoterV2,
        QUOTERV2_ABI,
        provider,
      );

      const amountBN = ethers.utils.parseUnits(
        amountsIn.amount,
        tokenIn.decimals,
      );

      const amountTinyBN = ethers.utils.parseUnits(
        '0.000001',
        tokenIn.decimals,
      );

      const encodedPath = encodeSwapPathWithDirection(
        swapRoutePath,
        tokenIn.address,
        tokenOut.address,
      );

      const [_, sqrtPriceX96List] =
        (await quoter.callStatic.quoteExactInput(encodedPath, amountTinyBN)) ||
        [];

      const [amountOut, sqrtPriceX96AfterList] =
        (await quoter.callStatic.quoteExactInput(encodedPath, amountBN)) || [];

      if (amountOut) {
        amountsOut.setAmount(
          ethers.utils.formatUnits(amountOut, tokenOut.decimals),
        );
      }

      Logger.log('========================================');
      const priceImpacts: Array<BigNumber> = [];
      swapRoutePath.forEach((pool, index) => {
        Logger.log(
          `Pool ${index + 1}`,
          `${pool.token0.symbol}-${pool.token1.symbol}`,
        );
        const sqrtPriceX96 = sqrtPriceX96List[index];
        const sqrtPriceX96After = sqrtPriceX96AfterList[index];
        const priceToken0 = sqrtToPrice(
          new BigNumber(sqrtPriceX96._hex),
          pool.token0.decimals,
          pool.token1.decimals,
          true,
        );
        const priceAfterToken0 = sqrtToPrice(
          new BigNumber(sqrtPriceX96After._hex),
          pool.token0.decimals,
          pool.token1.decimals,
          true,
        );
        const priceToken1 = new BigNumber(1).div(priceToken0);
        const priceAfterToken1 = new BigNumber(1).div(priceAfterToken0);
        Logger.log('\n');
        Logger.log('token0', pool.token0.symbol);
        Logger.log('token1', pool.token1.symbol);
        Logger.log('\n');
        Logger.log('[price before swap]');
        Logger.log(
          'price for 1',
          pool.token0.symbol,
          priceToken0.toString(),
          pool.token1.symbol,
        );
        Logger.log(
          'price for 1',
          pool.token1.symbol,
          priceToken1.toString(),
          pool.token0.symbol,
        );
        Logger.log('\n');
        Logger.log('[price after swap]');
        Logger.log(
          'price for 1',
          pool.token0.symbol,
          priceAfterToken0.toString(),
          pool.token1.symbol,
        );
        Logger.log(
          'price for 1',
          pool.token1.symbol,
          priceAfterToken1.toString(),
          pool.token0.symbol,
        );
        Logger.log('\n');

        const pi0 = priceAfterToken0
          .minus(priceToken0)
          .div(priceToken0)
          .multipliedBy(100);

        const pi1 = priceAfterToken1
          .minus(priceToken1)
          .div(priceToken1)
          .multipliedBy(100);

        if (
          pool.token0.address === tokenIn.address ||
          pool.token0.address === tokenOut.address
        ) {
          priceImpacts.push(pi0.abs());
          Logger.log('1');
        }

        if (
          pool.token1.address === tokenIn.address ||
          pool.token1.address === tokenOut.address
        ) {
          priceImpacts.push(pi1.abs());
          Logger.log('2');
        }

        Logger.log(
          'price impact for',
          pool.token0.symbol,
          pi0.toString().substring(0, 6),
          '%',
        );
        Logger.log(
          'price impact for',
          pool.token1.symbol,
          pi1.toString().substring(0, 6),
          '%',
        );
        Logger.log('--------------------------------');
      });

      let totalPriceImpact = priceImpacts.reduce(
        (prev, curr) => prev.plus(curr),
        new BigNumber(0),
      );

      if (swapRoutePath.length > 1) {
        totalPriceImpact = totalPriceImpact.div(swapRoutePath.length);
      } else {
        totalPriceImpact = totalPriceImpact.div(2);
      }

      setPriceImpact(totalPriceImpact);
      Logger.log('total price impact', totalPriceImpact.toString(), '%');
    } catch (err) {
      Logger.error('quoteSwapTransaction err', JSON.stringify(err, null, 2));
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Error',
        text2: `${err}`,
      });
      await sleep(3000);
      quoteSwapTransaction();
    } finally {
      isQuoterProcessRef.current = false;
      setQuoterProcess(false);
    }
  }, [
    swapRoutePath,
    amountsIn.amount,
    amountsOut.setAmount,
    tokenIn,
    tokenOut,
    isFocused,
  ]);

  const onPressSwap = useCallback(async () => {
    try {
      Logger.log('path', JSON.stringify(swapRoutePath, null, 2));
      if (!swapRoutePath || swapRoutePath.length === 0) {
        return Alert.alert('Error', 'No swap route found');
      }
      setSwapInProgress(true);

      const swapRouter = new ethers.Contract(
        SUSHISWAP_MAINNET_ADDRESSES.SwapRouterV3,
        V3SWAPROUTER_ABI,
      );

      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
      const amountBN = ethers.utils.parseUnits(
        amountsIn.amount,
        tokenIn.decimals,
      );

      const tokenInIsISLM = tokenIn.symbol === 'ISLM';

      const encodedPath = encodeSwapPathWithDirection(
        swapRoutePath,
        tokenIn.address,
        tokenOut.address,
      );
      const swapParams = [
        //  path
        encodedPath,
        // recipient
        address,
        //  deadline
        deadline,
        //  amountIn
        amountBN._hex,
        //  amountOutMinimum
        0,
      ];
      Logger.log('swapParams', JSON.stringify(swapParams, null, 2));

      const encodedTxData = swapRouter.interface.encodeFunctionData(
        'exactInput',
        [swapParams],
      ) as string;

      Logger.log('encodedTxData', encodedTxData);
      const rawTx = await awaitForJsonRpcSign({
        metadata: HAQQ_METADATA,
        selectedAccount: address,
        chainId: app.provider.ethChainId,
        request: {
          method: 'eth_signTransaction',
          params: [
            {
              from: address,
              to: SUSHISWAP_MAINNET_ADDRESSES.SwapRouterV3,
              value: tokenInIsISLM ? amountBN._hex : '0x0',
              data: encodedTxData,
            },
          ],
        },
      });

      const provider = await getRpcProvider(app.provider);
      const txHandler = await provider.sendTransaction(rawTx);
      const txResp = await txHandler.wait();
      Logger.log('txResp', txResp);
      await quoteSwapTransaction();
    } catch (err) {
      Logger.log('error', err);
    } finally {
      setSwapInProgress(false);
    }
  }, [
    swapRoutePath,
    amountsIn.amount,
    tokenIn,
    tokenOut,
    address,
    quoteSwapTransaction,
  ]);

  const onPressSelectToken = useCallback(
    async (setFn: React.Dispatch<any>, value: IToken & AwaitValue) => {
      const token = await awaitForValue({
        title: 'Select token',
        values: TOKENS,
        initialIndex: TOKENS.findIndex(it => it.address === value.address),
      });
      setFn(token);
    },
    [quoteSwapTransaction],
  );

  useEffect(() => {
    quoteSwapTransaction();
  }, [tokenIn.address, tokenOut.address]);

  return (
    <View style={styles.container}>
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
          editable={!isQuoterProcess}
          onBlur={quoteSwapTransaction}
        />
        <Spacer width={10} />
        <Button
          size={ButtonSize.small}
          style={styles.tokenButton}
          variant={ButtonVariant.second}
          title={tokenIn.symbol}
          onPress={() => onPressSelectToken(setTokenIn, tokenIn)}
        />
      </View>

      <Spacer height={10} />

      <View style={styles.amountContainer}>
        <First>
          {isLoading && (
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
          title={tokenOut.symbol}
          onPress={() => onPressSelectToken(setTokenOut, tokenOut)}
        />
      </View>

      <Spacer height={10} />

      {!!priceImpact && (
        <Text variant={TextVariant.t11}>
          Price impact: {priceImpact?.toString().substring(0, 6)}%
        </Text>
      )}

      <Spacer />

      <First>
        {needApproveTokenIn && (
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
          loading={isLoading || isSwapInProgress}
          disabled={isLoading || isSwapInProgress}
          onPress={onPressSwap}
        />
      </First>
      <Spacer height={50} />
    </View>
  );
});

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
