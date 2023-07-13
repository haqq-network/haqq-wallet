import {awaitForJsonRpcSign} from '@app/helpers/await-for-json-rpc-sign';
import {WalletConnect} from '@app/services/wallet-connect';
import {WalletConnectSessionRequestType} from '@app/types/wallet-connect';
import {isError} from '@app/utils';

export async function onWalletConnectSignTransaction(
  event: WalletConnectSessionRequestType,
) {
  try {
    const session = WalletConnect.instance.getSessionByTopic(event.topic);
    if (session) {
      const chainId = Number(event?.params?.chainId?.split?.(':')?.[1]);
      const result = await awaitForJsonRpcSign({
        chainId,
        request: event.params?.request,
        metadata: {
          url: session.peer.metadata.url,
          iconUrl: session.peer.metadata.icons?.[0],
        },
      });
      await WalletConnect.instance.approveSessionRequest(result, event);
    } else {
      await WalletConnect.instance.rejectSessionRequest(event.id, event.topic);
    }
  } catch (err) {
    if (isError(err)) {
      console.error('onWalletConnectSignTransaction error', err);
      await WalletConnect.instance.rejectSessionRequest(
        event.id,
        event.topic,
        err.message,
      );
    }
  }
}
