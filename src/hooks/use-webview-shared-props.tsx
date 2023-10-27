import React, {DependencyList, useCallback, useMemo, useRef} from 'react';

import Geolocation from '@react-native-community/geolocation';
import {useFocusEffect} from '@react-navigation/native';
import {Linking, NativeSyntheticEvent, Platform} from 'react-native';
import WebView, {WebViewProps} from 'react-native-webview';
import {WebViewMessageEvent} from 'react-native-webview/lib/RNCWebViewNativeComponent';
import {FileDownloadEvent} from 'react-native-webview/lib/WebViewTypes';

import {BrowserError} from '@app/components/browser-error';
import {DEBUG_VARS} from '@app/debug-vars';
import {
  GEO_WATCH_ID_KEY,
  WebViewGeolocation,
} from '@app/helpers/webview-geolocation';
import {VariablesString} from '@app/models/variables-string';
import {getUserAgent} from '@app/services/version';

import {useTesterModeEnabled} from './use-tester-mode-enabled';

export const useWebViewSharedProps = (
  ref: React.RefObject<WebView | null>,
  propsToMerge: Pick<
    WebViewProps,
    'onMessage' | 'injectedJavaScriptBeforeContentLoaded'
  > = {},
  deps: DependencyList = [],
): Partial<WebViewProps> => {
  const userAgent = useRef(getUserAgent()).current;
  const isTesterMode = useTesterModeEnabled();

  const renderError = useCallback(
    (...args: Parameters<NonNullable<WebViewProps['renderError']>>) => (
      <BrowserError reason={args[2]} />
    ),
    [],
  );

  const onFileDownload = useCallback(
    ({nativeEvent: {downloadUrl}}: FileDownloadEvent) => {
      if (downloadUrl) {
        Linking.openURL(downloadUrl);
      }
    },
    [],
  );

  useFocusEffect(() => {
    return () => {
      const watchID = VariablesString.get(GEO_WATCH_ID_KEY);
      if (watchID) {
        Geolocation.clearWatch(Number(watchID));
      }
    };
  });

  const onMessage = useCallback(
    async (event: NativeSyntheticEvent<WebViewMessageEvent>) => {
      if (!event?.nativeEvent?.data) {
        return;
      }

      event?.persist?.();

      if (ref.current) {
        const handled = await WebViewGeolocation.handleGeolocationRequest(
          ref.current,
          event,
        );

        if (handled) {
          return;
        }
      }

      if (typeof propsToMerge.onMessage === 'function') {
        propsToMerge.onMessage(event);
      }
    },
    [propsToMerge, ref],
  );

  const props: Partial<WebViewProps> = useMemo(
    () => ({
      contentMode: 'mobile',
      webviewDebuggingEnabled: __DEV__ || isTesterMode,
      incognito: DEBUG_VARS.enableWeb3BrowserIncognito,
      pullToRefreshEnabled: true,
      javaScriptCanOpenWindowsAutomatically: true,
      setSupportMultipleWindows: true,
      sharedCookiesEnabled: true,
      useSharedProcessPool: true,
      useWebView2: true,
      javaScriptEnabled: true,
      cacheEnabled: true,
      domStorageEnabled: true,
      allowsBackForwardNavigationGestures: true,
      thirdPartyCookiesEnabled: true,
      allowsInlineMediaPlayback: true,
      allowsFullscreenVideo: true,
      allowsLinkPreview: true,
      mediaPlaybackRequiresUserAction: true,
      geolocationEnabled: true,
      dataDetectorTypes: 'all',
      originWhitelist: ['*'],
      userAgent: userAgent,
      decelerationRate: 'normal',
      testID: 'haqq-wallet-webview',
      applicationNameForUserAgent: 'HAQQ Wallet',
      mediaCapturePermissionGrantType: 'prompt',
      injectedJavaScriptBeforeContentLoaded: `
        ${WebViewGeolocation.script}
        ${propsToMerge.injectedJavaScriptBeforeContentLoaded || ''}

        // injected properties
        window.platformOS = '${Platform.OS}'
        true;
      `,
      onMessage: onMessage,
      renderError: renderError,
      onFileDownload: onFileDownload,
    }),
    [isTesterMode, onFileDownload, onMessage, renderError, userAgent, ...deps],
  );

  return props;
};
