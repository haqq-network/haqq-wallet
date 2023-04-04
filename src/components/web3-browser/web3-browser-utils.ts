import {JsonRpcRequest} from 'json-rpc-engine';
import {Alert, Linking, Platform} from 'react-native';
import {WebViewMessageEvent} from 'react-native-webview';

import {WebViewEventsEnum, WindowInfoEvent} from './scripts';

export enum EthereumEventsEnum {
  ACCOUNTS_CHANGED = 'accountsChanged',
  CHAIN_CHANGED = 'chainChanged',
  DISCONNECT = 'disconnect',
}

export interface EthereumEventsParams {
  [EthereumEventsEnum.ACCOUNTS_CHANGED]: string[];
  [EthereumEventsEnum.CHAIN_CHANGED]: string;
  [EthereumEventsEnum.DISCONNECT]: undefined;
}

export function isJsonRpcRequest(obj: any): obj is JsonRpcRequest<any> {
  return (
    !!obj?.id &&
    typeof obj?.jsonrpc === 'string' &&
    typeof obj?.method === 'string'
  );
}

export function isWindowInfoEvent(obj: any): obj is WindowInfoEvent {
  return obj?.type === WebViewEventsEnum.WINDOW_INFO;
}

export const parseWebViewEventData = ({nativeEvent}: WebViewMessageEvent) => {
  try {
    return JSON.parse(nativeEvent.data);
  } catch {
    return nativeEvent.data;
  }
};

export const postMessageWebViewJS = (message: any, origin: string) => {
  return `
        (function () {
            try {
                window.postMessage(${JSON.stringify(message)}, '${origin}');
            } catch (err) {
                console.error('responseToEthJRPC error:', err.message)
            }
        })()
    `;
};

export const emitToEthereumJS = <EventName extends EthereumEventsEnum>(
  event: EventName,
  params?: EthereumEventsParams[EventName],
) => {
  // @ts-ignore
  params = params ? JSON.stringify(params) : 'undefined';
  return `
        if (window.ethereum) {
          window.ethereum.emit('${event}', ${params});
        }
        true;
    `;
};

export const changeWebViewHrefJS = (href: string) => {
  return `(function(){window.location.href = '${href}' })()`;
};

export const WebViewUserAgent = Platform.select({
  android:
    'Mozilla/5.0 (Linux; Android 10; Android SDK built for x86 Build/OSM1.180201.023) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.92 Mobile Safari/537.36',
  ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/76.0.3809.123 Mobile/15E148 Safari/605.1',
});

// Checking whether an application can navigate to another application through a deep link.
// return true if deeplink detected
export const detectDeeplinkAndNavigate = async (url: string) => {
  try {
    if (!/^https?:\/\//.test(url)) {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        Alert.alert('Warning', `This website has been open ${url}`, [
          {text: 'Ignore', style: 'destructive'},
          {text: 'Allow', onPress: () => Linking.openURL(url)},
        ]);
        return true;
      }
    }
  } catch (err) {
    console.log("checkAndNavigateToDepplink can't navigate to:", url);
  }
  return false;
};

export const showPhishingAlert = () => {
  return new Promise(resolve => {
    Alert.alert(
      'This link does not look secure',
      'This link leads to an unsafe site. We advise you not to log in to it and connect your accounts',
      [
        {text: 'Back', style: 'cancel'},
        {text: 'Continue', style: 'destructive', onPress: () => resolve(true)},
      ],
    );
  });
};

export const getOriginFromUrl = (url: string) => {
  let origin = '*';

  if (!url) {
    return origin;
  }

  const matches = url.match(/^(\w+:)\/\/([^/]+)(\/.*)?$/);
  if (matches) {
    origin = `${matches[1]}//${matches[2]}`;
  }
  return origin;
};
