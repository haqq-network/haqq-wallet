import {getSdkError} from '@walletconnect/utils';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {awaitForJsonRpcSign} from '@app/helpers/await-for-json-rpc-sign';
import {awaitForProvider} from '@app/helpers/await-for-provider';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {WalletConnect} from '@app/services/wallet-connect';
import {WalletConnectSessionRequestType} from '@app/types/wallet-connect';
import {isError} from '@app/utils';

const SIGN_METHOD_WHITELIST = [
  'eth_sendTransaction',
  'eth_signTransaction',
  'eth_sign',
  'personal_sign',
  'eth_signTypedData',
  'eth_signTypedData_v3',
  'eth_signTypedData_v4',
];

export async function onWalletConnectSignTransaction(
  event: WalletConnectSessionRequestType,
) {
  try {
    const session = WalletConnect.instance.getSessionByTopic(event.topic);
    const method = event?.params?.request?.method;

    if (session && method === 'wallet_switchEthereumChain') {
      const providers = Provider.getAll();
      const providerId = await awaitForProvider({
        providers,
        initialProviderId: app.providerId!,
        title: I18N.networks,
      });

      if (providerId) {
        app.providerId = providerId;
        await WalletConnect.instance.approveSessionRequest(providerId, event);
      } else {
        await WalletConnect.instance.rejectSessionRequest(
          event.id,
          event.topic,
          getSdkError('USER_REJECTED_CHAINS').message,
        );
      }
    }

    const isAllowed = SIGN_METHOD_WHITELIST.includes(method);
    if (session && method && isAllowed) {
      const [_, chainId, accountId] =
        session.namespaces.eip155?.accounts?.[0]?.split?.(':');

      const chainIdFromParams = event?.params?.chainId?.split?.(':')?.[1];

      const result = await awaitForJsonRpcSign({
        chainId: Number(chainId || chainIdFromParams),
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
