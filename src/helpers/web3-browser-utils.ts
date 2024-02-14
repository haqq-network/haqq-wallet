import URL from 'url';

import {JsonRpcRequest} from 'json-rpc-engine';
import {Alert, Linking} from 'react-native';
import {WebViewMessageEvent} from 'react-native-webview';

import {
  WebViewEventsEnum,
  WindowInfoEvent,
} from '@app/components/web3-browser/scripts';
import {onDynamicLink} from '@app/event-actions/on-dynamic-link';
import {I18N, getText} from '@app/i18n';
import {isValidUrl} from '@app/utils';
import {HAQQ_DYNAMIC_LINKS_HOSTNAME} from '@app/variables/common';

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

export const emitToWindowJS = (event: string, params?: any) => {
  params = params ? JSON.stringify(params) : 'undefined';
  return `
        window.dispatchEvent(new CustomEvent("${event}", {
          bubbles: true,
          detail: ${params},
        }))
        true;
    `;
};

export const changeWebViewUrlJS = (href: string) => {
  return `(function(){window.location.href = '${href}' })()`;
};

export const detectDeeplink = (url: string) =>
  !/^https?:\/\//.test(url) || !url.startsWith('http');

// Checking whether an application can navigate to another application through a deep link.
// return true if deeplink detected
export const detectDeeplinkAndNavigate = async (url: string) => {
  try {
    if (detectDeeplink(url)) {
      if (url.startsWith('haqq:')) {
        return Linking.openURL(url);
      }
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
    Logger.log("checkAndNavigateToDepplink can't navigate to:", url);
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

export const detectDynamicLink = (url: string) => {
  const {hostname, query} = URL.parse(url, true);
  return (
    !!hostname &&
    typeof query.link === 'string' &&
    HAQQ_DYNAMIC_LINKS_HOSTNAME.includes(hostname)
  );
};

export const detectDynamicLinkAndNavigate = async (url: string) => {
  return new Promise(resolve => {
    const {query} = URL.parse(url, true);
    if (detectDynamicLink(url)) {
      Alert.alert(
        getText(I18N.dynamicLinkDetactedTitle),
        getText(I18N.dynamicLinkDetactedDescription, {url}),
        [
          {
            text: getText(I18N.dynamicLinkDetactedIgnore),
            style: 'destructive',
            onPress: () => resolve(true),
          },
          {
            text: getText(I18N.dynamicLinkDetactedAllow),
            onPress: async () => {
              await onDynamicLink({url: query.link as string});
              resolve(true);
            },
          },
        ],
      );
    }
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
    endIndex > -1
      ? sanitizedUrl.substring(startIndex, endIndex)
      : sanitizedUrl.substring(startIndex);
  return (hostname || url).trim().toLowerCase();
}

export const getFavIconUrl = (url?: string | undefined) => {
  if (!url) {
    return '';
  }

  return `https://icons.duckduckgo.com/ip2/${getHost(url)}.ico`;
};
