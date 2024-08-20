import React, {useCallback, useMemo, useState} from 'react';

import {app} from '@app/contexts';
import {awaitForFee} from '@app/helpers/await-for-fee';
import {useTypedNavigation} from '@app/hooks';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {EstimationVariant, Fee} from '@app/models/fee';
import {Provider} from '@app/models/provider';
import {JsonRpcSignPopupStackParamList} from '@app/route-types';
import {EthNetwork} from '@app/services';
import {Balance} from '@app/services/balance';
import {
  AddressType,
  JsonRpcMetadata,
  PartialJsonRpcRequest,
  VerifyAddressResponse,
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
  verifyAddressResponse: VerifyAddressResponse | null;
  chainId?: number;
  hideContractAttention?: boolean;
  fee?: Fee | null;
  setFee: React.Dispatch<React.SetStateAction<Fee | null>>;
}

export const JsonRpcTransactionInfo = ({
  request,
  metadata,
  verifyAddressResponse,
  chainId,
  hideContractAttention,
  fee,
  setFee,
}: JsonRpcTransactionInfoProps) => {
  const navigation = useTypedNavigation<JsonRpcSignPopupStackParamList>();

  const [isFeeLoading, setFeeLoading] = useState(true);
  const [isSwapRenderError, setIsSwapRenderError] = useState(false);

  const tx = useMemo(
    () => getTransactionFromJsonRpcRequest(request),
    [request],
  );

  const provider = useMemo(() => {
    return Provider.getByEthChainId(
      tx?.chainId ?? chainId ?? app.provider.ethChainId,
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

  const txParsedData = useMemo(() => parseTxDataFromHexInput(tx?.data), [tx]);

  const functionName = useMemo(() => {
    if (txParsedData) {
      return txParsedData.name;
    }
    return '';
  }, [txParsedData]);

  const isSwapTx = useMemo(
    () => ['exactInput', 'deposit', 'withdraw'].includes(functionName),
    [functionName],
  );

  const calculateFee = useCallback(async () => {
    if (!tx) {
      return Balance.Empty;
    }

    try {
      const data = await EthNetwork.estimate(
        {
          from: tx.from!,
          to: tx.to!,
          value: new Balance(
            tx.value || Balance.Empty,
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
      return Balance.Empty;
    }
  }, [tx, provider]);

  const onFeePress = useCallback(async () => {
    if (!tx) {
      return;
    }

    if (fee) {
      const result = await awaitForFee({
        fee,
        from: tx.from!,
        to: tx.to!,
        value: new Balance(
          tx.value! || Balance.Empty,
          provider?.decimals,
          provider?.denom,
        ),
        data: tx.data,
        chainId: provider?.ethChainId ? String(provider.ethChainId) : undefined,
      });
      setFee(result);
    }
  }, [navigation, tx, fee, provider]);

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
      {!isSwapRenderError && isSwapTx && isContract && isInWhiteList && (
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
        onFeePress={onFeePress}
      />
    </First>
  );
};
