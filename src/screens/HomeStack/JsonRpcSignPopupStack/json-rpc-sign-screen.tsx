import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {ethers} from 'ethers';
import {observer} from 'mobx-react';

import {JsonRpcSign} from '@app/components/json-rpc-sign/json-rpc-sign';
import {getMessageByRequest} from '@app/components/json-rpc-sign/json-rpc-sign-info';
import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {DEBUG_VARS} from '@app/debug-vars';
import {ModalStore, showModal} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {
  EthereumMessageChecker,
  EthereumSignInMessage,
} from '@app/helpers/ethereum-message-checker';
import {getRpcProvider} from '@app/helpers/get-rpc-provider';
import {getHost} from '@app/helpers/web3-browser-utils';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useBackNavigationHandler} from '@app/hooks/use-back-navigation-handler';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {useLayoutAnimation} from '@app/hooks/use-layout-animation';
import {AppStore} from '@app/models/app';
import {Fee} from '@app/models/fee';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {HomeStackParamList, HomeStackRoutes} from '@app/route-types';
import {Balance} from '@app/services/balance';
import {EthSignErrorDataDetails} from '@app/services/eth-sign';
import {EventTracker} from '@app/services/event-tracker';
import {Indexer} from '@app/services/indexer';
import {SignJsonRpcRequest} from '@app/services/sign-json-rpc-request';
import {IContract, MarketingEvents, ModalType, WalletType} from '@app/types';
import {
  getTransactionFromJsonRpcRequest,
  getUserAddressFromJRPCRequest,
} from '@app/utils';
import {EIP155_SIGNING_METHODS} from '@app/variables/EIP155';

export const JsonRpcSignScreen = observer(() => {
  const [isAllowed, setIsAllowed] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [signLoading, setSignLoading] = useState(false);
  const [verifyAddressResponse, setVerifyAddressResponse] =
    useState<IContract | null>(null);
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
    async (err?: EthSignErrorDataDetails | string, custom = false) => {
      EventTracker.instance.trackEvent(
        custom
          ? MarketingEvents.jsonRpcSignFail
          : MarketingEvents.jsonRpcSignUserReject,
        {
          error: typeof err === 'string' ? err : err ? JSON.stringify(err) : '',
        },
      );
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
        const EVENT_PARAMS = {
          transaction_request: JSON.stringify(request),
          chainId: chainId?.toString() ?? '',
          wallet_address: wallet?.address ?? '',
        };
        EventTracker.instance.trackEvent(
          MarketingEvents.jsonRpcSignStart,
          EVENT_PARAMS,
        );
        if (phishingTxRequest && Object.values(phishingTxRequest).length) {
          Logger.error('JsonRpcSignScreen:onPressSign tx is phishing', {
            request,
            phishingTxRequest,
          });
          return onPressReject(
            'transaction contains phishing signature request',
            true,
          );
        }

        if (messageIsHex && blindSignEnabled === false && isAllowed === false) {
          Logger.error(
            'JsonRpcSignScreen:onPressSign hex blind sign does not allowed',
            {
              request,
              messageIsHex,
            },
          );
          return onPressReject('hex blind sign does not allowed', true);
        }

        if (
          !isAllowed &&
          !(
            DEBUG_VARS.disableWeb3DomainBlocking ||
            AppStore.isTesterModeEnabled ||
            Provider.getByEthChainId(chainId!)!.isTestnet
          )
        ) {
          return onPressReject('domain is blocked', true);
        }
        setSignLoading(true);

        const result = await SignJsonRpcRequest.signEIP155Request(
          wallet!,
          {
            ...request,
            params: isTransaction
              ? getTransactionFromJsonRpcRequest(request, fee)
              : request.params,
          },
          chainId,
        );

        app.emit('json-rpc-sign-success', result);
        EventTracker.instance.trackEvent(
          MarketingEvents.jsonRpcSignSuccess,
          request.method === 'eth_sendTransaction'
            ? {
                ...EVENT_PARAMS,
                transaction_hash: result,
              }
            : EVENT_PARAMS,
        );
        navigation.goBack();
      } catch (e) {
        const err = e as EthSignErrorDataDetails;
        const txInfo = err?.transaction;
        const errCode = err?.code;
        if (errCode === 'INSUFFICIENT_FUNDS') {
          const provider = Provider.getByEthChainId(chainId!)!;
          const rpcProvider = await getRpcProvider(provider);

          const getBalance = async () => {
            try {
              const b1 = Wallet.getBalance(
                wallet!.address,
                'available',
                provider,
              );
              if (b1.isPositive()) {
                return b1;
              }
              const b2 = await rpcProvider.getBalance(wallet!.address);
              return new Balance(b2, provider.decimals, provider.denom);
            } catch (_err) {
              Logger.captureException(_err, 'JsonRpcSignScreen:getBalance');
              return new Balance('0x0', provider.decimals, provider.denom);
            }
          };

          const getFee = () => {
            try {
              if (fee?.expectedFee?.isPositive?.()) {
                return fee.expectedFee;
              }
              const gasLimit = ethers.BigNumber.from(txInfo?.gasLimit ?? 0);
              const maxFeePerGas = ethers.BigNumber.from(
                txInfo?.maxFeePerGas ?? 0,
              );
              const maxPriorityFeePerGas = ethers.BigNumber.from(
                txInfo?.maxPriorityFeePerGas ?? 0,
              );
              return new Balance(
                gasLimit.mul(maxFeePerGas.add(maxPriorityFeePerGas)),
                provider.decimals,
                provider.denom,
              );
            } catch (_err) {
              Logger.captureException(_err, 'JsonRpcSignScreen:getFee');
              return new Balance('0x0', provider.decimals, provider.denom);
            }
          };
          showModal(ModalType.notEnoughGas, {
            gasLimit: getFee(),
            currentAmount: await getBalance(),
          });
        }
        onPressReject(err, true);
        Logger.captureException(err, 'JsonRpcSignScreen:onPressSign', {
          request,
          chainId,
          errCode,
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

  useEffect(() => {
    if (wallet && wallet.type === WalletType.watchOnly) {
      onPressReject(
        'Watch-only wallets do not allow signing transactions.',
        true,
      );
    }
  }, [wallet, onPressReject]);

  useEffectAsync(async () => {
    try {
      setIsLoading(true);
      let toAddress: string | undefined;
      let message_or_input: string | undefined = '0x0';

      switch (request.method) {
        case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
        case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
          const txParams = getTransactionFromJsonRpcRequest(request)!;
          toAddress = txParams.to;
          message_or_input = txParams.data;
          break;
        case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
        case EIP155_SIGNING_METHODS.ETH_SIGN:
          const message = getMessageByRequest(request);
          message_or_input = message.original;
          break;
      }

      const indexer = new Indexer(chainId);
      const {
        contract,
        domain_in_whitelist,
        // is_eip4361,
        // input_is_valid,
        // message_is_valid,
      } = await indexer.verifyContract({
        domain: metadata.url,
        method_name: request.method,
        address: AddressUtils.toHaqq(toAddress!),
        message_or_input,
      });

      setVerifyAddressResponse(contract);

      // disable domain validation for developer mode
      if (AppStore.isTesterModeEnabled) {
        setIsAllowed(true);
      } else {
        setIsAllowed(domain_in_whitelist);
        if (
          !domain_in_whitelist &&
          !ModalStore.isExist(ModalType.domainBlocked)
        ) {
          showModal(ModalType.domainBlocked, {
            domain: getHost(metadata.url),
            onClose: () => onPressReject('domain is blocked', true),
          });
        }
      }
    } catch (err) {
      Logger.captureException(err, 'JsonRpcSignScreen:verifyContract');
    } finally {
      setIsLoading(false);
    }
  }, [request, metadata, chainId]);

  // TODO: replace with verifyContract when backend implementation will be ready
  useEffect(() => {
    const {isHex, parsedTx, signInMessage} =
      EthereumMessageChecker.checkRequest(request);

    setPhisingTxRequest(parsedTx);
    setMessageIsHex(isHex);
    setEthereumSignInMessage(signInMessage);
  }, [request]);

  useEffect(() => {
    const address = selectedAccount || getUserAddressFromJRPCRequest(request);
    if (!address) {
      onPressReject(`method not implemented: ${request.method}`, true);
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
