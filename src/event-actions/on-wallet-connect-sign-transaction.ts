import {getSdkError} from '@walletconnect/utils';

import {Events} from '@app/events';
import {awaitForJsonRpcSign} from '@app/helpers/await-for-json-rpc-sign';
import {awaitForProvider} from '@app/helpers/await-for-provider';
import {
  QRScannerTypeEnum,
  awaitForScanQr,
} from '@app/helpers/await-for-scan-qr';
import {I18N, getText} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {WalletConnect} from '@app/services/wallet-connect';
import {WalletConnectSessionRequestType} from '@app/types/wallet-connect';
import {isError, requestQRScannerPermission} from '@app/utils';

const SIGN_METHOD_WHITELIST = [
  'eth_sendTransaction',
  'eth_signTransaction',
  'eth_sign',
  'personal_sign',
  'eth_signTypedData_v3',
  'eth_signTypedData_v4',
];

export async function onWalletConnectSignTransaction(
  event: WalletConnectSessionRequestType,
) {
  try {
    const session = WalletConnect.instance.getSessionByTopic(event.topic);
    const method = event?.params?.request?.method;
    const chainId = Number(event?.params?.chainId?.split(':')?.[1]);
    if (session && method === 'wallet_switchEthereumChain') {
      const providerId = await awaitForProvider({
        providers: Provider.getAllEVM(),
        initialProviderChainId: chainId,
        title: I18N.networks,
      });

      if (providerId) {
        Provider.setSelectedProviderId(providerId);
        await WalletConnect.instance.approveSessionRequest(providerId, event);
      } else {
        await WalletConnect.instance.rejectSessionRequest(
          event.id,
          event.topic,
          getSdkError('USER_REJECTED_CHAINS').message,
        );
      }
    }

    if (session && method === 'wallet_scanQRCode') {
      // @ts-ignore
      const pattern = event?.params?.[0] as string;

      if (!!pattern && typeof pattern !== 'string') {
        await WalletConnect.instance.rejectSessionRequest(
          event.id,
          event.topic,
          getText(I18N.jsonRpcErrorInvalidParams),
        );
      }

      const isAccesGranted = await requestQRScannerPermission(
        session.peer.metadata.url,
      );

      if (!isAccesGranted) {
        await WalletConnect.instance.rejectSessionRequest(
          event.id,
          event.topic,
          getSdkError('USER_REJECTED').message,
        );
      }

      const result = await awaitForScanQr({
        pattern,
        variant: QRScannerTypeEnum.qr,
      });
      await WalletConnect.instance.approveSessionRequest(result, event);
    }

    const isAllowed = SIGN_METHOD_WHITELIST.includes(method);
    if (session && method && isAllowed) {
      const [_namespace, chainIdFromNamespace, accountId] =
        session.namespaces.eip155?.accounts?.[0]?.split?.(':');

      const result = await awaitForJsonRpcSign({
        chainId: chainId || Number(chainIdFromNamespace),
        request: event.params?.request,
        metadata: {
          url: session.peer.metadata.url,
          iconUrl: session.peer.metadata.icons?.[0],
        },
        selectedAccount: accountId,
      });
      await WalletConnect.instance.approveSessionRequest(result, event);
    } else {
      await WalletConnect.instance.rejectSessionRequest(event.id, event.topic);
    }
  } catch (err) {
    if (isError(err)) {
      Logger.captureException(err, Events.onWalletConnectSignTransaction, {
        event,
      });
      await WalletConnect.instance.rejectSessionRequest(
        event.id,
        event.topic,
        err.message || getSdkError('USER_REJECTED').message,
      );
    }
  }
}
