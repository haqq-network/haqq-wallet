import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';

import {ethers} from 'ethers';

import {JsonRpcSign} from '@app/components/json-rpc-sign';
import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {DEBUG_VARS} from '@app/debug-vars';
import {ModalStore, showModal} from '@app/helpers';
import {
  EthereumMessageChecker,
  EthereumSignInMessage,
} from '@app/helpers/ethereum-message-checker';
import {getHost} from '@app/helpers/web3-browser-utils';
import {Whitelist} from '@app/helpers/whitelist';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useBackNavigationHandler} from '@app/hooks/use-back-navigation-handler';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {useLayoutAnimation} from '@app/hooks/use-layout-animation';
import {useRemoteConfigVar} from '@app/hooks/use-remote-config';
import {Fee} from '@app/models/fee';
import {Wallet} from '@app/models/wallet';
import {HomeStackParamList, HomeStackRoutes} from '@app/route-types';
import {Balance} from '@app/services/balance';
import {EthSignErrorDataDetails} from '@app/services/eth-sign';
import {SignJsonRpcRequest} from '@app/services/sign-json-rpc-request';
import {ModalType, VerifyAddressResponse} from '@app/types';
import {
  getTransactionFromJsonRpcRequest,
  getUserAddressFromJRPCRequest,
} from '@app/utils';
import {EIP155_SIGNING_METHODS} from '@app/variables/EIP155';

export const JsonRpcSignScreen = memo(() => {
  const whitelist = useRemoteConfigVar('web3_app_whitelist');
  const [isAllowed, setIsAllowed] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [signLoading, setSignLoading] = useState(false);
  const [verifyAddressResponse, setVerifyAddressResponse] =
    useState<VerifyAddressResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [phishingTxRequest, setPhisingTxRequest] =
    useState<ethers.Transaction | null>(null);
  const [messageIsHex, setMessageIsHex] = useState<boolean>(false);
  const [ethereumSignInMessage, setEthereumSignInMessage] =
    useState<EthereumSignInMessage | null>(null);
  const [blindSignEnabled, setBlindSignEnabled] = useState(
    app.blindSignEnabled,
  );

  const {animate} = useLayoutAnimation();
  const navigation = useTypedNavigation<HomeStackParamList>();
  const {
    metadata,
    request,
    chainId,
    selectedAccount,
    hideContractAttention = false,
  } = useTypedRoute<HomeStackParamList, HomeStackRoutes.JsonRpcSign>().params ||
  {};

  const isTransaction = useMemo(
    () =>
      request.method === EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION ||
      request.method === EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION,
    [request],
  );

  const wallet = useMemo(
    () =>
      Wallet.getById(
        selectedAccount ?? getUserAddressFromJRPCRequest(request)!,
      ),
    [request, selectedAccount],
  );

  const onPressReject = useCallback(
    async (err?: EthSignErrorDataDetails | string) => {
      setRejectLoading(true);
      app.emit('json-rpc-sign-reject', err);
      navigation.goBack();
    },
    [navigation],
  );

  const onPressAllowOnceSignDangerousTx = useCallback(async () => {
    const confirmed = await app.requsetPinConfirmation();
    animate();
    setBlindSignEnabled(confirmed);
  }, [setBlindSignEnabled, animate]);

  const onPressSign = useCallback(
    async (fee?: Fee | null) => {
      try {
        if (phishingTxRequest && Object.values(phishingTxRequest).length) {
          return Logger.error('JsonRpcSignScreen:onPressSign tx is phishing', {
            request,
            phishingTxRequest,
          });
        }

        if (messageIsHex && blindSignEnabled === false && isAllowed === false) {
          return Logger.error(
            'JsonRpcSignScreen:onPressSign hex blind sign does not allowed',
            {
              request,
              messageIsHex,
            },
          );
        }

        if (
          !isAllowed &&
          !(DEBUG_VARS.disableWeb3DomainBlocking || app.isTesterMode)
        ) {
          return onPressReject('domain is blocked');
        }
        setSignLoading(true);

        const result = await SignJsonRpcRequest.signEIP155Request(
          wallet!,
          {
            ...request,
            params: {
              ...(isTransaction
                ? getTransactionFromJsonRpcRequest(request)
                : request.params),
              ...(fee
                ? {
                    gasLimit: fee.gasLimit?.toHex(),
                    maxPriorityFeePerGas: fee.maxPriorityFee?.toHex(),
                    maxFeePerGas: fee.maxBaseFee?.toHex(),
                  }
                : {}),
            },
          },
          chainId,
        );

        app.emit('json-rpc-sign-success', result);
        navigation.goBack();
      } catch (e) {
        const err = e as EthSignErrorDataDetails;
        const txInfo = err?.transaction;
        const errCode = err?.code;
        if (
          !!txInfo?.gasLimit &&
          !!txInfo?.maxFeePerGas &&
          errCode === 'INSUFFICIENT_FUNDS'
        ) {
          err.handled = true;
          const gasLimit = new Balance(txInfo.gasLimit).operate(
            new Balance(txInfo.maxFeePerGas),
            'mul',
          );
          showModal(ModalType.notEnoughGas, {
            gasLimit,
            currentAmount: app.getAvailableBalance(wallet!.address),
          });
        }
        onPressReject(err);
        Logger.captureException(err, 'JsonRpcSignScreen:onPressSign', {
          request,
          chainId,
        });
      }
    },
    [
      chainId,
      isAllowed,
      navigation,
      onPressReject,
      request,
      wallet,
      phishingTxRequest,
      messageIsHex,
      blindSignEnabled,
    ],
  );

  const checkContractAddress = useCallback(async () => {
    if (isTransaction) {
      const params = getTransactionFromJsonRpcRequest(request);

      if (params?.to) {
        const info = await Whitelist.verifyAddress(params.to);
        if (info) {
          setVerifyAddressResponse(info);
        }
      }
    }
  }, [isTransaction, request]);

  useEffect(() => {
    const {isHex, parsedTx, signInMessage} =
      EthereumMessageChecker.checkRequest(request);

    setPhisingTxRequest(parsedTx);
    setMessageIsHex(isHex);
    setEthereumSignInMessage(signInMessage);
  }, [request]);

  useEffectAsync(async () => {
    try {
      await checkContractAddress();
    } catch (err) {
      Logger.captureException(err, 'JsonRpcSignScreen:checkContractAddress');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffectAsync(async () => {
    const isAllowedDomain = await Whitelist.checkUrl(metadata.url);
    setIsAllowed(isAllowedDomain);
    if (!isAllowedDomain && !ModalStore.isExist(ModalType.domainBlocked)) {
      showModal(ModalType.domainBlocked, {
        domain: getHost(metadata.url),
        onClose: () => onPressReject('domain is blocked'),
      });
    }
  }, [metadata, onPressReject, whitelist]);

  useEffect(() => {
    const address = selectedAccount || getUserAddressFromJRPCRequest(request);
    if (!address) {
      onPressReject(`method not implemented: ${request.method}`);
    }
  }, [onPressReject, request, selectedAccount]);

  useBackNavigationHandler(() => {
    app.emit('json-rpc-sign-reject');
  }, []);

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
      chainId={chainId}
      verifyAddressResponse={verifyAddressResponse}
      hideContractAttention={hideContractAttention}
      isAllowedDomain={isAllowed}
      phishingTxRequest={phishingTxRequest}
      messageIsHex={messageIsHex}
      blindSignEnabled={blindSignEnabled}
      ethereumSignInMessage={ethereumSignInMessage}
      onPressReject={onPressReject}
      onPressSign={onPressSign}
      onPressAllowOnceSignDangerousTx={onPressAllowOnceSignDangerousTx}
    />
  );
});
