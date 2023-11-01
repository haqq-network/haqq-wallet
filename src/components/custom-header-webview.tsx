import React, {useCallback, useMemo, useState} from 'react';

import WebView, {WebViewProps} from 'react-native-webview';
import {
  ShouldStartLoadRequest,
  WebViewSourceUri,
} from 'react-native-webview/lib/WebViewTypes';

import {getAppHeaders} from '@app/helpers/get-app-headers';

export type CustomHeaderWebViewProps = Omit<WebViewProps, 'source'> & {
  source: WebViewSourceUri;
  browserType: 'inapp' | 'web3';
};

export const CustomHeaderWebView = React.forwardRef<
  WebView,
  CustomHeaderWebViewProps
>((props, ref) => {
  const {onShouldStartLoadWithRequest, browserType, source, ...restProps} =
    props;

  const [currentURI, setURI] = useState(props.source.uri);
  const headers = useMemo(
    () => ({
      ...(source.headers as Record<string, string>),
      ...getAppHeaders(browserType),
    }),
    [source.headers, browserType],
  );

  const newSource: WebViewSourceUri = useMemo(
    () => ({...source, uri: currentURI, headers}),
    [currentURI, source, headers],
  );

  const handleStartLoadWithRequest = useCallback(
    (request: ShouldStartLoadRequest) => {
      if (typeof onShouldStartLoadWithRequest === 'function') {
        const result = onShouldStartLoadWithRequest(request);
        if (!result) {
          setURI(request.url);
        }
        return result;
      }

      // If we're loading the current URI, allow it to load
      if (request.url === currentURI) {
        return true;
      }
      // We're loading a new URL -- change state first
      setURI(request.url);
      return false;
    },
    [],
  );

  return (
    <WebView
      {...restProps}
      ref={ref}
      source={newSource}
      onShouldStartLoadWithRequest={handleStartLoadWithRequest}
    />
  );
});
