import React, {useCallback, useRef} from 'react';

import {Linking, Share} from 'react-native';
import WebView from 'react-native-webview';
import {FileDownloadEvent} from 'react-native-webview/lib/WebViewTypes';

import {InAppBrowser} from '@app/components/in-app-browser';
import {openURL} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const InAppBrowserScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'inAppBrowser'>();
  const webviewRef = useRef<WebView>(null);

  const onCloseBottomSheet = useCallback(() => {
    navigation.canGoBack() && navigation.goBack();
  }, [navigation]);

  const onPressGoBack = useCallback(() => {
    webviewRef?.current?.goBack?.();
  }, []);

  const onPressGoForward = useCallback(() => {
    webviewRef?.current?.goForward?.();
  }, []);

  const onPressExport = useCallback((url: string) => {
    Share.share({url});
  }, []);

  const onPressBrowser = useCallback((url: string) => {
    openURL(url);
  }, []);

  const onFileDownload = useCallback(
    ({nativeEvent: {downloadUrl}}: FileDownloadEvent) => {
      if (downloadUrl) {
        Linking.openURL(downloadUrl);
      }
    },
    [],
  );

  return (
    <InAppBrowser
      url={route.params?.url}
      webviewRef={webviewRef}
      title={route.params?.title}
      onPressClose={onCloseBottomSheet}
      onPressGoBack={onPressGoBack}
      onPressGoForward={onPressGoForward}
      onPressExport={onPressExport}
      onPressBrowser={onPressBrowser}
      onFileDownload={onFileDownload}
    />
  );
};
