import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {JsonRpcSign} from '@app/components/json-rpc-sign';
import {app} from '@app/contexts';
import {getHost} from '@app/helpers/web3-browser-utils';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useRemoteConfigVar} from '@app/hooks/use-remote-config';
import {Wallet} from '@app/models/wallet';
import {SignJsonRpcRequest} from '@app/services/sign-json-rpc-request';
import {getUserAddressFromJRPCRequest} from '@app/utils';
import {EIP155_SIGNING_METHODS} from '@app/variables/EIP155';

export const JsonRpcSignScreen = () => {
  const whitelist = useRemoteConfigVar('web3_app_whitelist');
  const [isAllowed, setIsAllowed] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [signLoading, setSignLoading] = useState(false);
  const navigation = useTypedNavigation();
  const {metadata, request, chainId, selectedAccount} =
    useTypedRoute<'jsonRpcSign'>().params || {};

  useEffect(() => {
    const host = getHost(metadata.url);
    setIsAllowed(
      !!whitelist?.find?.(url => new RegExp(host).test(url))?.length,
    );
  }, [metadata, whitelist]);

  useEffect(() => {
    const onBlur = () => {
      app.emit('json-rpc-sign-reject');
    };

    navigation.addListener('blur', onBlur);
    return () => navigation.removeListener('blur', onBlur);
  }, [navigation]);

  const isTransaction = useMemo(
    () =>
      request.method === EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION ||
      request.method === EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION,
    [request],
  );

  const wallet = useMemo(
    () =>
      Wallet.getById(selectedAccount || getUserAddressFromJRPCRequest(request)),
    [request, selectedAccount],
  );

  const onPressSign = useCallback(async () => {
    try {
      setSignLoading(true);
      const result = await SignJsonRpcRequest.signEIP155Request(
        wallet!,
        request,
        chainId,
      );
      app.emit('json-rpc-sign-success', result);
    } catch (err) {
      if (err instanceof Error) {
        app.emit('json-rpc-sign-reject', err.message);
        console.log('🔴 JsonRpcSignScreen:onPressSign error', err);
      }
    } finally {
      navigation.goBack();
    }
  }, [chainId, navigation, request, wallet]);

  const onPressReject = useCallback(async () => {
    setRejectLoading(true);
    app.emit('json-rpc-sign-reject');
    navigation.goBack();
  }, [navigation]);

  return (
    <JsonRpcSign
      isAllowed={isAllowed}
      rejectLoading={rejectLoading}
      signLoading={signLoading}
      isTransaction={isTransaction}
      wallet={wallet!}
      metadata={metadata}
      request={request}
      onPressReject={onPressReject}
      onPressSign={onPressSign}
    />
  );
};
