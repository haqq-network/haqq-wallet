import React, {DependencyList, useCallback, useMemo, useRef} from 'react';

import {makeID} from '@haqq/shared-react-native';
import Geolocation from '@react-native-community/geolocation';
import {useFocusEffect} from '@react-navigation/native';
import {Linking, NativeSyntheticEvent, Platform} from 'react-native';
import fs from 'react-native-fs';
import WebView, {WebViewProps} from 'react-native-webview';
import {WebViewMessageEvent} from 'react-native-webview/lib/RNCWebViewNativeComponent';
import {FileDownloadEvent} from 'react-native-webview/lib/WebViewTypes';

import {BrowserError} from '@app/components/browser-error';
import {DEBUG_VARS} from '@app/debug-vars';
import {WebviewAjustMiddleware} from '@app/helpers/webview-adjust-middleware';
import {WebViewGeolocation} from '@app/helpers/webview-geolocation';
import {WebViewLogger} from '@app/helpers/webview-logger';
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
  const instanceId = useRef(makeID(5)).current;
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

  useFocusEffect(
    useCallback(() => {
      return () => {
        VariablesString.getAllGeoWatchIds(instanceId).forEach(({id, value}) => {
          Logger.log('clear watch', {id, value});
          Geolocation.clearWatch(Number(value));
          VariablesString.remove(id);
        });
      };
    }, []),
  );

  const onMessage = useCallback(
    async (event: NativeSyntheticEvent<WebViewMessageEvent>) => {
      if (!event?.nativeEvent?.data) {
        return;
      }

      event?.persist?.();

      if (ref.current) {
        if (
          await WebViewGeolocation.handleGeolocationRequest(
            ref.current,
            event,
            instanceId,
          )
        ) {
          return;
        }

        if (await WebviewAjustMiddleware.handleMessage(event)) {
          return;
        }
      }

      if (typeof propsToMerge.onMessage === 'function') {
        return propsToMerge.onMessage(event);
      }
    },
    [propsToMerge, ref],
  );

  // @ts-ignore
  const props: WebViewProps = useMemo(
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
      allowFileAccess: true,
      allowFileAccessFromFileURLs: true,
      allowingReadAccessToURL: 'file://' + root(),
      allowUniversalAccessFromFileURLs: true,
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
      injectedJavaScriptForMainFrameOnly: true,
      injectedJavaScriptBeforeContentLoadedForMainFrameOnly: true,
      injectedJavaScriptBeforeContentLoaded: `
        // injected properties
        window.platformOS = '${Platform.OS}'
        window.__HAQQWALLET__ = {}

        ${WebViewLogger.script}
        ${WebViewGeolocation.script}
        ${WebviewAjustMiddleware.script}
        ${propsToMerge.injectedJavaScriptBeforeContentLoaded || ''}
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

function root(dir = '/www/') {
  var path =
    Platform.OS === 'android' ? fs.DocumentDirectoryPath : fs.MainBundlePath;
  return path + dir;
}
