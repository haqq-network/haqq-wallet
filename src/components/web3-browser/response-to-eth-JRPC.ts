import {RefObject} from 'react';

import WebView, {WebViewMessageEvent} from 'react-native-webview';

export const JS_POST_MESSAGE_TO_PROVIDER = (
  message: any,
  origin: string,
) => `(function () {
  try {
    window.postMessage(${JSON.stringify(message)}, '${origin}');
  } catch (err) {
    console.error('responseToEthJRPC error:', err.message)
  }
})()`;

interface GetResultParams {
  method: string;
}

export type JRPCResult =
  | string
  | number
  | object
  | Array<JRPCResult>
  | undefined
  | null;

interface Params {
  webviewRef: RefObject<WebView>;
  event: WebViewMessageEvent;
  getResult(params: GetResultParams): JRPCResult | Promise<JRPCResult>;
}

export const responseToEthJRPC = async ({
  event,
  webviewRef,
  getResult,
}: Params) => {
  try {
    const eventData = JSON.parse(event.nativeEvent.data);

    if (eventData?.name === 'metamask-provider') {
      const result = await getResult?.({method: eventData?.data?.method});

      if (!result) {
        console.log(
          '🟡',
          eventData?.data?.method,
          'not implemented, params:',
          JSON.stringify(eventData?.data?.params, null, 2),
        );
        return true;
      }

      const data = {
        id: eventData?.data?.id,
        jsonrpc: eventData?.jsonrpc || '2.0',
        result,
      };

      const message = {
        data,
        name: eventData?.name,
        origin: eventData.origin,
      };

      const js = JS_POST_MESSAGE_TO_PROVIDER(message, eventData.origin);
      webviewRef?.current?.injectJavaScript?.(js);
      console.log('🟣 result', eventData?.data?.method, result);
      return true;
    }
  } catch (err) {
    console.error('responseToEthJRPC', err);
  }
  return false;
};
