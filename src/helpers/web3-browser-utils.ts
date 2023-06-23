import {JsonRpcRequest} from 'json-rpc-engine';
import {Alert, Linking} from 'react-native';
import {WebViewMessageEvent} from 'react-native-webview';

import {isValidUrl} from '@app/utils';

import {
  WebViewEventsEnum,
  WindowInfoEvent,
} from '../components/web3-browser/scripts';

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

export interface EthereumChainParams {
  chainId: string;
  chainName: string;
  nativeCurrency: NativeCurrency;
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

interface NativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
}

export function isEthereumChainParams(obj: any): obj is EthereumChainParams {
  return !!obj?.chainId && !!obj?.chainName && Array.isArray(obj?.rpcUrls);
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

export const changeWebViewUrlJS = (href: string) => {
  return `(function(){window.location.href = '${href}' })()`;
};

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

export const clearUrl = (url: string) => {
  const result = getOriginFromUrl(url).replace(/^[a-zA-Z]*:\/\//, '');
  if (result === '*') {
    return url;
  }

  return result;
};
/**
 * Returns URL prefixed with protocol
 *
 * @param url - String corresponding to url
 * @param defaultProtocol - Protocol string to append to URLs that have none
 * @returns - String corresponding to sanitized input depending if it's a search or url
 */
export const prefixUrlWithProtocol = (
  url: string,
  defaultProtocol = 'https://',
) => {
  const hasProtocol = /^[a-zA-Z]*:\/\//.test(url);
  const sanitizedURL = hasProtocol ? url : `${defaultProtocol}${url}`;
  return sanitizedURL;
};

/**
 * Returns URL prefixed with protocol, which could be a search engine url if
 * a keyword is detected instead of a url
 *
 * @param input - String corresponding to url input
 * @param searchEngine - Protocol string to append to URLs that have none
 * @param defaultProtocol - Protocol string to append to URLs that have none
 * @returns - String corresponding to sanitized input depending if it's a search or url
 */
export const onUrlSubmit = (
  input: string,
  searchEngine = 'Google',
  defaultProtocol = 'https://',
) => {
  //Check if it's a url or a keyword
  const regEx = new RegExp(
    /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!&',;=.+]+$/g,
  );
  if (!isValidUrl(input) && !regEx.test(input)) {
    // Add exception for localhost
    if (
      !input.startsWith('http://localhost') &&
      !input.startsWith('localhost')
    ) {
      // In case of keywords we default to google search
      let searchUrl =
        'https://www.google.com/search?q=' + encodeURIComponent(input);
      if (searchEngine === 'DuckDuckGo') {
        searchUrl = 'https://duckduckgo.com/?q=' + encodeURIComponent(input);
      }
      return searchUrl;
    }
  }
  return prefixUrlWithProtocol(input, defaultProtocol);
};

/**
 * Return host from url string
 *
 * @param url - String containing url
 * @param defaultProtocol
 * @returns - String corresponding to host
 */
export function getHost(url: string, defaultProtocol = 'https://') {
  const valid = isValidUrl(url);
  if (!valid) {
    return url;
  }

  const sanitizedUrl = prefixUrlWithProtocol(url, defaultProtocol);
  const startIndex = sanitizedUrl.indexOf('//') + 2;
  const endIndex = sanitizedUrl.indexOf('/', startIndex);
  const hostname =
    endIndex === -1
      ? url.substring(startIndex)
      : url.substring(startIndex, endIndex);
  const result = hostname === '' ? url : hostname;
  return result;
}

export const getFavIconUrl = (url?: string | undefined, size = 200) => {
  if (!url) {
    return '';
  }

  return `https://api.faviconkit.com/${getHost(url)}/${size}`;
};
