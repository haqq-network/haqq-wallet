import React, {useCallback, useMemo, useRef, useState} from 'react';

import {BigNumber, ethers} from 'ethers';
import {observer} from 'mobx-react';
import {
  ActivityIndicator,
  ImageSourcePropType,
  ScrollView,
  View,
} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

import {Color} from '@app/colors';
import {
  DataView,
  First,
  Icon,
  IconsName,
  Loading,
  Spacer,
  Text,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {AddressUtils, NATIVE_TOKEN_ADDRESS} from '@app/helpers/address-utils';
import {shortAddress} from '@app/helpers/short-address';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {I18N} from '@app/i18n';
import {Contracts} from '@app/models/contracts';
import {Currencies} from '@app/models/currencies';
import {Fee} from '@app/models/fee';
import {Provider} from '@app/models/provider';
import {Token} from '@app/models/tokens';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {Indexer, SushiPoolEstimateResponse} from '@app/services/indexer';
import {
  JsonRpcMetadata,
  JsonRpcTransactionRequest,
  VerifyAddressResponse,
} from '@app/types';
import {formatNumberString, openInAppBrowser, sleep} from '@app/utils';
import {STRINGS} from '@app/variables/common';

import {ImageWrapper} from '../image-wrapper';
import {
  SwapRoutePathIcons,
  SwapRoutePathIconsType,
} from '../swap/swap-route-path-icons';

export interface JsonRpcSwapTransactionProps {
  metadata: JsonRpcMetadata;
  provider: Provider | undefined;
  isFeeLoading: boolean;
  functionName: string;
  fee: Fee | null | undefined;
  tx: Partial<JsonRpcTransactionRequest> | undefined;
  parsedInput: ethers.utils.TransactionDescription | undefined;
  chainId: string | number;
  verifyAddressResponse: VerifyAddressResponse | null;

  onFeePress: () => void;
  onError: () => void;
}

type Token = {
  address: string;
  amount: Balance;
  image: ImageSourcePropType;
};

const MAX_ESTIMATE_ATTEMPTS = 3;

export const JsonRpcSwapTransaction = observer(
  ({
    provider,
    isFeeLoading,
    fee,
    functionName,
    parsedInput,
    chainId,
    tx,
    onFeePress,
    onError,
  }: JsonRpcSwapTransactionProps) => {
    const estimateAbortController = useRef(new AbortController());
    const estimateAttempt = useRef(0);
    const [estimateData, setEstimateData] =
      useState<SushiPoolEstimateResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [tokenIn, setTokenIn] = useState<Token | null>(null);
    const [tokenOut, setTokenOut] = useState<Token | null>(null);
    const [minReceivedAmount, setMinReceivedAmount] = useState<Balance | null>(
      null,
    );
    const [isWETHInteraction, setIsWETHInteraction] = useState(false);

    const rate = useMemo(() => {
      const r =
        (tokenOut?.amount?.toFloat() ?? 0) /
        new Balance(
          estimateData?.amount_in!,
          tokenIn?.amount.getPrecission(),
          tokenIn?.amount.getSymbol(),
        ).toFloat();
      return new Balance(r, 0, tokenOut?.amount.getSymbol()).toBalanceString(
        'auto',
      );
    }, [tokenOut, tokenIn, estimateData]);

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

    const providerFee = useMemo(() => {
      const symbol = tokenIn?.amount?.getSymbol()!;
      const decimals = tokenIn?.amount?.getPrecission()!;
      if (!estimateData?.fee) {
        return new Balance(Balance.Empty, decimals, symbol);
      }
      return new Balance(estimateData?.fee.amount || '0', decimals, symbol);
    }, [tokenIn, estimateData]);

    const onPressRoutingSource = useCallback(() => {
      openInAppBrowser(provider?.getAddressExplorerUrl?.(tx?.to!)!);
    }, [provider, tx]);

    useEffectAsync(async () => {
      const indexer = new Indexer(chainId);

      const estimate = async () => {
        let amountOutMinimum = '0x0',
          tokenInAddress = '',
          tokenOutAddress = '',
          response: SushiPoolEstimateResponse | null;

        if (functionName === 'exactInput') {
          estimateAbortController?.current?.abort();
          estimateAbortController.current = new AbortController();

          const [path, recipient, _, amountIn, _amountOutMinimum] = parsedInput
            ?.args[0]! as [
            string, // path
            string, // recipient
            number, // deadline
            BigNumber, // amountIn
            BigNumber, //  amountOutMinimum
          ];
          amountOutMinimum = _amountOutMinimum._hex;
          const matchArray = path.match(
            /^0x([a-fA-F0-9]{40}).*([a-fA-F0-9]{40})$/,
          );

          // first 40 characters of path doesn't include the '0x' prefix
          tokenInAddress = `0x${matchArray?.[1]}`;
          // last 40 characters of path
          tokenOutAddress = `0x${matchArray?.[2]}`;

          response = await indexer.sushiPoolEstimate({
            amount: amountIn._hex,
            sender: recipient,
            route: path.slice(2),
            currency_id: Currencies.currency?.id,
            abortSignal: estimateAbortController.current?.signal,
          });
        }

        if (functionName === 'exactInput') {
          const [path, recipient, _, amountIn, _amountOutMinimum] = parsedInput
            ?.args[0]! as [
            string, // path
            string, // recipient
            number, // deadline
            BigNumber, // amountIn
            BigNumber, //  amountOutMinimum
          ];
          amountOutMinimum = _amountOutMinimum._hex;
          const matchArray = path.match(
            /^0x([a-fA-F0-9]{40}).*([a-fA-F0-9]{40})$/,
          );

          // first 40 characters of path doesn't include the '0x' prefix
          tokenInAddress = `0x${matchArray?.[1]}`;
          // last 40 characters of path
          tokenOutAddress = `0x${matchArray?.[2]}`;

          response = await indexer.sushiPoolEstimate({
            amount: amountIn._hex,
            sender: recipient,
            route: path.slice(2),
            currency_id: Currencies.currency?.id,
          });
        }

        // unwrap
        if (functionName === 'withdraw') {
          const config = await indexer.getProviderConfig();
          tokenInAddress = config.weth_address;
          tokenOutAddress = NATIVE_TOKEN_ADDRESS;
          amountOutMinimum = parsedInput?.args[0];

          response = {
            allowance: '0x0',
            amount_in: parsedInput?.args[0],
            amount_out: parsedInput?.args[0],
            fee: {
              amount: '0',
              denom: Currencies.currency?.id!,
            },
            gas_estimate: '0x0',
            initialized_ticks_crossed_list: [0],
            need_approve: false,
            route: `${tokenInAddress}000000${tokenOutAddress.slice(2)}`,
            s_amount_in: '0x0',
            s_assumed_amount_out: '0x0',
            s_gas_spent: 0,
            s_price_impact: '0',
            s_primary_price: '0',
            s_swap_price: '0',
            sqrt_price_x96_after_list: [],
          };
        }

        // wrap
        if (functionName === 'deposit') {
          const config = await indexer.getProviderConfig();
          tokenInAddress = NATIVE_TOKEN_ADDRESS;
          tokenOutAddress = config.weth_address;
          amountOutMinimum = tx?.value!;

          response = {
            allowance: '0x0',
            amount_in: tx?.value!,
            amount_out: tx?.value!,
            fee: {
              amount: '0',
              denom: Currencies.currency?.id!,
            },
            gas_estimate: '0x0',
            initialized_ticks_crossed_list: [0],
            need_approve: false,
            route: `${tokenInAddress}000000${tokenOutAddress.slice(2)}`,
            s_amount_in: '0x0',
            s_assumed_amount_out: '0x0',
            s_gas_spent: 0,
            s_price_impact: '0',
            s_primary_price: '0',
            s_swap_price: '0',
            sqrt_price_x96_after_list: [],
          };
        }

        const recipientWallet = Wallet.getById(tx?.from)!;
        const tokenInIsNativeCoin = new Balance(tx?.value!).isPositive();
        const tokenOutIsNativeCoin = AddressUtils.equals(
          tokenOutAddress,
          NATIVE_TOKEN_ADDRESS,
        );

        const tokenInContract = tokenInIsNativeCoin
          ? Token.generateNativeToken(recipientWallet)
          : Token.getById(tokenInAddress)!;

        const tokenOutContract = tokenOutIsNativeCoin
          ? Token.generateNativeToken(recipientWallet)
          : Token.getById(tokenOutAddress)!;

        setTokenIn(() => ({
          address: tokenInAddress,
          amount: new Balance(
            response?.amount_in!,
            tokenInContract?.decimals!,
            tokenInContract?.symbol!,
          ),
          image: tokenInContract?.image,
        }));

        setTokenOut(() => ({
          address: tokenOutAddress,
          amount: new Balance(
            response?.amount_out!,
            tokenOutContract?.decimals!,
            tokenOutContract?.symbol!,
          ),
          image: tokenOutContract?.image,
        }));

        setMinReceivedAmount(
          new Balance(
            amountOutMinimum,
            tokenOutContract?.decimals!,
            tokenOutContract?.symbol!,
          ),
        );

        setEstimateData(() => response);
        setIsLoading(() => false);
      };

      try {
        await estimate();
      } catch (err) {
        if (estimateAttempt.current < MAX_ESTIMATE_ATTEMPTS) {
          await sleep(1000);
          estimateAttempt.current++;
        } else {
          onError?.();
        }
      }

      const networkConfig = await indexer.getProviderConfig();
      setIsWETHInteraction(
        AddressUtils.equals(tx?.to!, networkConfig.weth_address),
      );
      return () => {
        estimateAbortController?.current?.abort();
      };
    }, [onError, chainId]);

    if (isLoading) {
      return <Loading />;
    }

    return (
      <View style={styles.container}>
        <Spacer height={8} />

        <Text
          variant={TextVariant.t11}
          i18n={I18N.transactionDetailAmountIn}
          color={Color.textBase2}
        />
        <View style={styles.tokenContainer}>
          <ImageWrapper source={tokenIn?.image!} style={styles.tokenImage} />
          <Spacer width={10} />
          <Text variant={TextVariant.t3}>
            {tokenIn?.amount.toBalanceString('auto')}
          </Text>
        </View>
        <Text variant={TextVariant.t15} color={Color.textBase2}>
          ≈{STRINGS.NBSP}
          {tokenIn?.amount.toFiat({useDefaultCurrency: true, fixed: 6})}
        </Text>

        <Spacer height={12} />
        <Icon i24 name={IconsName.swap_vertical} color={Color.graphicBase1} />
        <Spacer height={12} />

        <Text
          variant={TextVariant.t11}
          i18n={I18N.transactionDetailAmountOut}
          color={Color.textBase2}
        />
        <View style={styles.tokenContainer}>
          <ImageWrapper source={tokenOut?.image!} style={styles.tokenImage} />
          <Spacer width={10} />
          <Text variant={TextVariant.t3}>
            {tokenOut?.amount.toBalanceString('auto')}
          </Text>
        </View>
        <Text variant={TextVariant.t15} color={Color.textBase2}>
          ≈{STRINGS.NBSP}
          {tokenOut?.amount.toFiat({useDefaultCurrency: true, fixed: 6})}
        </Text>

        <Spacer height={32} />

        <ScrollView
          style={styles.info}
          contentContainerStyle={styles.infoContentContainer}
          showsVerticalScrollIndicator={false}>
          <DataView i18n={I18N.swapScreenRate}>
            <Text variant={TextVariant.t11} color={Color.textBase1}>
              {`1${STRINGS.NBSP}${tokenIn?.amount?.getSymbol()}${
                STRINGS.NBSP
              }≈${STRINGS.NBSP}${rate}`}
            </Text>
          </DataView>
          {!isWETHInteraction && (
            <>
              <DataView i18n={I18N.swapScreenPriceImpact}>
                <Text variant={TextVariant.t11} color={priceImpactColor}>
                  {`${formatNumberString(
                    estimateData?.s_price_impact ?? '0',
                  )}%`}
                </Text>
              </DataView>
              <DataView i18n={I18N.swapScreenProviderFee}>
                <Text variant={TextVariant.t11} color={Color.textBase1}>
                  {providerFee.toFiat({useDefaultCurrency: true, fixed: 6})}
                </Text>
              </DataView>
              <DataView i18n={I18N.swapScreenMinimumReceived}>
                <Text variant={TextVariant.t11} color={priceImpactColor}>
                  {minReceivedAmount?.toBalanceString('auto')}
                </Text>
              </DataView>
            </>
          )}
          {!!provider?.id && (
            <DataView i18n={I18N.transactionInfoNetwork}>
              <Text variant={TextVariant.t11} color={Color.textBase1}>
                {provider.name}
              </Text>
            </DataView>
          )}
          <DataView i18n={I18N.transactionInfoNetworkFee}>
            <First>
              {isFeeLoading && <ActivityIndicator />}
              <TouchableWithoutFeedback onPress={onFeePress}>
                <View style={styles.feeContainer}>
                  <Text variant={TextVariant.t11} color={Color.textGreen1}>
                    {fee?.expectedFeeString}
                  </Text>
                  <Icon name={IconsName.tune} color={Color.textGreen1} />
                </View>
              </TouchableWithoutFeedback>
            </First>
          </DataView>
          <DataView i18n={I18N.swapScreenRoutingSource}>
            <Text
              onPress={onPressRoutingSource}
              variant={TextVariant.t11}
              color={Color.textGreen1}>
              {Contracts.getById(tx?.to!)?.name}
              {STRINGS.NBSP}
              {shortAddress(tx?.to!, '•', true)}
            </Text>
          </DataView>
          <DataView i18n={I18N.swapScreenRoute}>
            <SwapRoutePathIcons
              type={SwapRoutePathIconsType.path}
              hexPath={estimateData?.route ?? ''}
            />
          </DataView>
        </ScrollView>
        <Spacer height={10} />
      </View>
    );
  },
);

const styles = createTheme({
  info: {
    width: '100%',
    flex: 1,
  },
  infoContentContainer: {
    borderRadius: 16,
    backgroundColor: Color.bg3,
  },
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  feeContainer: {
    flexDirection: 'row',
  },
  tokenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});
