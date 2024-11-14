import React, {useCallback, useMemo, useState} from 'react';

import {observer} from 'mobx-react';

import {awaitForFee} from '@app/helpers/await-for-fee';
import {useTypedNavigation} from '@app/hooks';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {EstimationVariant, Fee} from '@app/models/fee';
import {Provider} from '@app/models/provider';
import {WalletModel} from '@app/models/wallet';
import {JsonRpcSignPopupStackParamList} from '@app/route-types';
import {EthNetwork} from '@app/services';
import {Balance} from '@app/services/balance';
import {
  AddressType,
  IContract,
  JsonRpcMetadata,
  PartialJsonRpcRequest,
} from '@app/types';
import {
  getTransactionFromJsonRpcRequest,
  isContractTransaction,
  parseTxDataFromHexInput,
} from '@app/utils';

import {JsonRpcCommonTransaction} from './json-rpc-common-transaction';
import {JsonRpcSwapTransaction} from './json-rpc-swap-transaction';

import {First} from '../ui';

interface JsonRpcTransactionInfoProps {
  request: PartialJsonRpcRequest;
  metadata: JsonRpcMetadata;
  verifyAddressResponse: IContract | null;
  chainId?: number;
  hideContractAttention?: boolean;
  fee?: Fee | null;
  setFee: React.Dispatch<React.SetStateAction<Fee | null>>;
  isFeeLoading: boolean;
  setFeeLoading: React.Dispatch<React.SetStateAction<boolean>>;
  wallet: WalletModel;
}

export const JsonRpcTransactionInfo = observer(
  ({
    request,
    metadata,
    verifyAddressResponse,
    chainId,
    hideContractAttention,
    fee,
    setFee,
    isFeeLoading,
    setFeeLoading,
    wallet,
  }: JsonRpcTransactionInfoProps) => {
    const navigation = useTypedNavigation<JsonRpcSignPopupStackParamList>();

    const [isSwapRenderError, setIsSwapRenderError] = useState(false);

    const tx = useMemo(
      () => getTransactionFromJsonRpcRequest(request),
      [request],
    );

    const provider = useMemo(() => {
      return Provider.getByEthChainId(
        tx?.chainId ?? chainId ?? Provider.selectedProvider.ethChainId,
      );
    }, [chainId, tx]);

    const isContract = useMemo(
      () =>
        verifyAddressResponse?.address_type === AddressType.contract ||
        isContractTransaction(tx),
      [tx, verifyAddressResponse],
    );

    const isInWhiteList = useMemo(
      () => !!verifyAddressResponse?.is_in_white_list,
      [verifyAddressResponse],
    );

    const showSignContratAttention =
      !hideContractAttention && isContract && !isInWhiteList;

    const txParsedData = useMemo(() => {
      return parseTxDataFromHexInput(tx?.data);
    }, [tx]);

    const functionName = useMemo(() => {
      if (txParsedData) {
        return txParsedData.name;
      }
      return '';
    }, [txParsedData]);

    const isSwapTx = useMemo(() => {
      if (['exactInput', 'deposit', 'withdraw'].includes(functionName)) {
        return true;
      }

      // swap to native token and unwrap
      // look https://github.com/haqq-network/haqq-wallet/blob/6a64d63a20686fc1a711737784ad9e0514723d6d/src/screens/SwapStack/swap-screen.tsx#L855
      if (functionName === 'multicall') {
        const [exactInputTxData, unwrapWETH9TxData] = txParsedData
          ?.args[0]! as [string, string];
        const exactInputParsed = parseTxDataFromHexInput(exactInputTxData);
        const unwrapWETH9Parsed = parseTxDataFromHexInput(unwrapWETH9TxData);
        return (
          exactInputParsed?.name === 'exactInput' &&
          unwrapWETH9Parsed?.name === 'unwrapWETH9'
        );
      }
      return false;
    }, [functionName]);

    const calculateFee = useCallback(async () => {
      const empty = new Balance(0, provider?.decimals, provider?.denom);

      if (!tx) {
        return empty;
      }

      try {
        const data = await EthNetwork.estimate(
          {
            from: tx.from! || wallet.address,
            to: tx.to!,
            value: new Balance(
              tx.value || empty,
              provider?.decimals,
              provider?.denom,
            ),
            data: tx.data,
          },
          EstimationVariant.average,
          provider,
        );
        setFee(new Fee(data));
        return data.expectedFee;
      } catch {
        return empty;
      }
    }, [tx, provider]);

    const onFeePress = useCallback(async () => {
      if (!tx) {
        return;
      }

      if (fee) {
        const result = await awaitForFee({
          fee,
          from: tx.from! || wallet.address,
          to: tx.to!,
          value: new Balance(
            tx.value! || '0x0',
            provider?.decimals,
            provider?.denom,
          ),
          data: tx.data,
          chainId: provider?.ethChainId ? provider.ethChainId : undefined,
        });
        setFee(result);
      }
    }, [navigation, tx, fee, provider, wallet]);

    const onSwapRenderError = useCallback(() => {
      setIsSwapRenderError(true);
    }, []);

    useEffectAsync(async () => {
      if (!fee?.calculatedFees) {
        try {
          if (tx) {
            setFeeLoading(true);
            await calculateFee();
          }
        } catch (err) {
          Logger.captureException(err, 'JsonRpcTransactionInfo:calculateFee', {
            params: tx,
            chainId,
          });
        } finally {
          setFeeLoading(false);
        }
      } else {
        setFeeLoading(false);
      }
    }, [chainId]);

    return (
      <First>
        {!isSwapRenderError && isSwapTx && isContract && (
          <JsonRpcSwapTransaction
            verifyAddressResponse={verifyAddressResponse}
            metadata={metadata}
            parsedInput={txParsedData}
            provider={provider}
            functionName={functionName}
            isFeeLoading={isFeeLoading}
            chainId={provider?.ethChainId!}
            fee={fee}
            tx={tx}
            onFeePress={onFeePress}
            onError={onSwapRenderError}
          />
        )}

        <JsonRpcCommonTransaction
          metadata={metadata}
          showSignContratAttention={showSignContratAttention}
          functionName={functionName}
          isContract={isContract}
          provider={provider}
          isFeeLoading={isFeeLoading}
          parsedInput={txParsedData}
          fee={fee}
          tx={tx}
          chainId={
            tx?.chainId ?? chainId ?? Provider.selectedProvider.ethChainId!
          }
          onFeePress={onFeePress}
        />
      </First>
    );
  },
);
