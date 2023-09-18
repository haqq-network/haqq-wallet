import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {JsonRpcSign} from '@app/components/json-rpc-sign';
import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {DEBUG_VARS} from '@app/debug-vars';
import {showModal} from '@app/helpers';
import {getHost} from '@app/helpers/web3-browser-utils';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {useRemoteConfigVar} from '@app/hooks/use-remote-config';
import {Wallet} from '@app/models/wallet';
import {SignJsonRpcRequest} from '@app/services/sign-json-rpc-request';
import {VerifyAddressResponse} from '@app/types';
import {
  getTransactionFromJsonRpcRequest,
  getUserAddressFromJRPCRequest,
  isError,
  verifyAddress,
} from '@app/utils';
import {EIP155_SIGNING_METHODS} from '@app/variables/EIP155';

export const JsonRpcSignScreen = () => {
  const whitelist = useRemoteConfigVar('web3_app_whitelist');
  const [isAllowed, setIsAllowed] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [signLoading, setSignLoading] = useState(false);
  const [verifyAddressResponse, setVerifyAddressResponse] =
    useState<VerifyAddressResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useTypedNavigation();
  const {metadata, request, chainId, selectedAccount} =
    useTypedRoute<'jsonRpcSign'>().params || {};

  const isTransaction = useMemo(
    () =>
      request.method === EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION ||
      request.method === EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION,
    [request],
  );

  const wallet = useMemo(
    () =>
      Wallet.getById(
        selectedAccount || getUserAddressFromJRPCRequest(request)!,
      ),
    [request, selectedAccount],
  );

  const onPressReject = useCallback(
    async (errMsg?: string) => {
      setRejectLoading(true);
      app.emit('json-rpc-sign-reject', errMsg);
      navigation.goBack();
    },
    [navigation],
  );

  const onPressSign = useCallback(async () => {
    try {
      if (!isAllowed && !DEBUG_VARS.disableWeb3DomainBlocking) {
        return onPressReject('domain is blocked');
      }
      setSignLoading(true);
      const result = await SignJsonRpcRequest.signEIP155Request(
        wallet!,
        request,
        chainId,
      );
      app.emit('json-rpc-sign-success', result);
      navigation.goBack();
    } catch (err) {
      if (isError(err)) {
        onPressReject(err.message);
        Logger.captureException(err, 'JsonRpcSignScreen:onPressSign', {
          request,
          chainId,
        });
      }
    }
  }, [chainId, isAllowed, navigation, onPressReject, request, wallet]);

  const checkContractAddress = useCallback(async () => {
    if (isTransaction) {
      const params = getTransactionFromJsonRpcRequest(request);

      if (params?.from) {
        const info = await verifyAddress(params.from);
        if (info) {
          setVerifyAddressResponse(info);
        }
      }
    }
  }, [isTransaction, request]);

  useEffectAsync(async () => {
    try {
      await checkContractAddress();
    } catch (err) {
      Logger.captureException(err, 'JsonRpcSignScreen:checkContractAddress');
    } finally {
      setIsLoading(false);
    }
  }, [checkContractAddress]);

  useEffect(() => {
    const host = getHost(metadata.url);
    const isAllowedDomain = !!whitelist?.find?.(url =>
      new RegExp(host).test(url),
    )?.length;
    setIsAllowed(isAllowedDomain);
    if (!isAllowedDomain && !DEBUG_VARS.disableWeb3DomainBlocking) {
      showModal('domainBlocked', {
        domain: host,
        onClose: () => onPressReject('domain is blocked'),
      });
    }
  }, [metadata, onPressReject, whitelist]);

  useEffect(() => {
    const onBlur = () => {
      app.emit('json-rpc-sign-reject');
    };

    navigation.addListener('blur', onBlur);
    return () => navigation.removeListener('blur', onBlur);
  }, [navigation]);

  useEffect(() => {
    const address = selectedAccount || getUserAddressFromJRPCRequest(request);
    if (!address) {
      onPressReject(`method not implemented: ${request.method}`);
    }
  }, [onPressReject, request, selectedAccount]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <JsonRpcSign
      rejectLoading={rejectLoading}
      signLoading={signLoading}
      isTransaction={isTransaction}
      wallet={wallet!}
      metadata={metadata}
      request={request}
      verifyAddressResponse={verifyAddressResponse}
      onPressReject={onPressReject}
      onPressSign={onPressSign}
    />
  );
};
