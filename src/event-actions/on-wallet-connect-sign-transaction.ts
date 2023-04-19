import {awaitForJsonRpcSign} from '@app/helpers/await-for-json-rpc-sign';
import {WalletConnect} from '@app/services/wallet-connect';
import {WalletConnectSessionRequestType} from '@app/types/wallet-connect';

export async function onWalletConnectSignTransaction(
  event: WalletConnectSessionRequestType,
) {
  console.log('here', event);
  try {
    const session = WalletConnect.instance.getSessionByTopic(event.topic);
    console.log(event.id, session?.peer);

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
    await WalletConnect.instance.rejectSessionRequest(event.id, event.topic);
    console.error('onWalletConnectSignTransaction error', err);
  }
}
