import React, {useCallback, useMemo, useRef, useState} from 'react';

import {PhishingController} from '@metamask/phishing-controller';
import {parseUri} from '@walletconnect/utils';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import WebView, {WebViewProps} from 'react-native-webview';
import {
  ShouldStartLoadRequest,
  WebViewNavigation,
  WebViewNavigationEvent,
} from 'react-native-webview/lib/WebViewTypes';

import {Color} from '@app/colors';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {createTheme} from '@app/helpers';
import {
  changeWebViewUrlJS,
  detectDeeplink,
  detectDeeplinkAndNavigate,
  showPhishingAlert,
} from '@app/helpers/web3-browser-utils';
import {getUserAgent} from '@app/services/version';
import {getHostnameFromUrl} from '@app/utils';
import {IS_ANDROID} from '@app/variables/common';

import {BrowserError} from './browser-error';
import {Icon, IconButton, IconsName, Spacer, Text} from './ui';
import {Separator} from './ui/separator';

type InAppBrowserProps = {
  url: string;
  webviewRef: React.RefObject<WebView<{}>>;
  title?: string;
  onPressClose: () => void;
  onPressGoBack: () => void;
  onPressGoForward: () => void;
  onPressExport: (url: string) => void;
  onPressBrowser: (url: string) => void;
};

export const InAppBrowser = ({
  url,
  title,
  webviewRef,
  onPressClose,
  onPressGoBack,
  onPressGoForward,
  onPressBrowser,
  onPressExport,
}: InAppBrowserProps) => {
  const [navigationEvent, setNavigationEvent] = useState<WebViewNavigation>();
  const [isPageLoading, setPageLoading] = useState(false);
  const isFirstPageLoaded = useRef(false);
  const userAgent = useRef(getUserAgent()).current;
  const phishingController = useRef(new PhishingController()).current;

  const pageTitle = useMemo(
    () =>
      title ||
      navigationEvent?.title ||
      getHostnameFromUrl(url) ||
      'In-App Browser',
    [navigationEvent?.title, title, url],
  );

  const renderError = useCallback(
    (...args: Parameters<NonNullable<WebViewProps['renderError']>>) => (
      <BrowserError reason={args[2]} />
    ),
    [],
  );

  const onContentProcessDidTerminate = useCallback(() => {
    webviewRef?.current?.reload?.();
  }, [webviewRef]);

  const onLoad = useCallback(
    (event: WebViewNavigationEvent) => {
      setNavigationEvent(event.nativeEvent);

      if (event?.nativeEvent?.navigationType === 'backforward') {
        webviewRef?.current?.reload();
      }
    },
    [webviewRef],
  );

  const onPressRefresh = useCallback(() => {
    webviewRef?.current?.reload?.();
  }, [webviewRef]);

  const onPressStopLoading = useCallback(() => {
    webviewRef?.current?.stopLoading?.();
  }, [webviewRef]);

  const handlePressExport = useCallback(() => {
    const currentUrl = navigationEvent?.url || url;
    onPressExport?.(currentUrl);
  }, [navigationEvent?.url, onPressExport, url]);

  const handlePressBrowser = useCallback(() => {
    const currentUrl = navigationEvent?.url || url;
    onPressBrowser?.(currentUrl);
  }, [navigationEvent?.url, onPressBrowser, url]);

  const onLoadStart = useCallback(() => {
    setPageLoading(true);
  }, []);

  const onLoadEnd = useCallback(() => {
    if (!isFirstPageLoaded.current) {
      isFirstPageLoaded.current = true;
      const eventId = `${Events.openInAppBrowserPageLoaded}-${url}`;
      app.emit(eventId);
    }
    setPageLoading(false);
  }, [url]);

  const go = useCallback(
    async (nextUrl: string) => {
      await phishingController.maybeUpdateState();
      const {result} = phishingController.test(nextUrl);

      if (result) {
        const allowNavigateToPhishing = await showPhishingAlert();
        if (!allowNavigateToPhishing) {
          return;
        }
      }

      if (await detectDeeplinkAndNavigate(nextUrl)) {
        return;
      }

      const js = changeWebViewUrlJS(nextUrl);
      webviewRef?.current?.injectJavaScript(js);
    },
    [phishingController, webviewRef],
  );

  const onShouldStartLoadWithRequest = useCallback(
    ({url: nextUrl}: ShouldStartLoadRequest) => {
      if (nextUrl === 'about:blank') {
        return true;
      }

      const {result} = phishingController.test(nextUrl);
      if (result) {
        showPhishingAlert().then(allowNavigateToPhishing => {
          if (allowNavigateToPhishing) {
            go(nextUrl);
          }
        });
        return false;
      }

      if (parseUri(nextUrl)?.protocol === 'wc') {
        app.emit(Events.onWalletConnectUri, nextUrl);
        return false;
      }

      if (detectDeeplink(nextUrl)) {
        go(nextUrl);
        return false;
      }

      return true;
    },
    [go, phishingController],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleContainer}>
        {isPageLoading && (
          <IconButton onPress={onPressStopLoading}>
            <Icon i24 name={IconsName.close} color={Color.graphicSecond2} />
          </IconButton>
        )}
        {!isPageLoading && (
          <IconButton onPress={onPressRefresh}>
            <Icon i24 name={IconsName.refresh} color={Color.graphicSecond2} />
          </IconButton>
        )}
        <Text
          t8
          center
          children={pageTitle}
          style={styles.title}
          numberOfLines={1}
        />
        <IconButton onPress={onPressClose}>
          <Icon
            i24
            name={IconsName.close_circle}
            color={Color.graphicSecond2}
          />
        </IconButton>
      </View>
      <View style={styles.webviewContainer}>
        <WebView
          bounces={false}
          scrollEnabled
          // @ts-ignore
          sendCookies
          useWebkit
          javascriptEnabled
          startInLoadingState
          allowsInlineMediaPlayback
          allowsBackForwardNavigationGestures
          allowsFullscreenVideo
          allowsLinkPreview
          mediaPlaybackRequiresUserAction
          dataDetectorTypes={'all'}
          originWhitelist={['*']}
          ref={webviewRef}
          userAgent={userAgent}
          onLoad={onLoad}
          onLoadStart={onLoadStart}
          onLoadEnd={onLoadEnd}
          renderError={renderError}
          onContentProcessDidTerminate={onContentProcessDidTerminate}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          source={{uri: url}}
          decelerationRate={'normal'}
          testID={'in-app-browser-webview'}
          applicationNameForUserAgent={'HAQQ Wallet'}
        />
      </View>
      <View style={styles.actionPanel}>
        <Spacer width={40} />
        <IconButton
          disabled={!navigationEvent?.canGoBack}
          onPress={onPressGoBack}>
          <Icon
            i24
            color={
              navigationEvent?.canGoBack
                ? Color.graphicBase1
                : Color.graphicBase2
            }
            name={IconsName.arrow_back}
          />
        </IconButton>
        <Spacer />
        <IconButton
          disabled={!navigationEvent?.canGoForward}
          onPress={onPressGoForward}>
          <Icon
            i24
            color={
              navigationEvent?.canGoForward
                ? Color.graphicBase1
                : Color.graphicBase2
            }
            name={IconsName.arrow_forward}
          />
        </IconButton>
        <Spacer />
        <IconButton onPress={handlePressExport}>
          <Icon i24 name={IconsName.export} color={Color.graphicBase1} />
        </IconButton>
        <Spacer />
        <IconButton onPress={handlePressBrowser}>
          <Icon i24 name={IconsName.browser} color={Color.graphicBase1} />
        </IconButton>
        <Spacer width={40} />
      </View>
      {IS_ANDROID && <Separator height={StyleSheet.hairlineWidth} />}
    </SafeAreaView>
  );
};

const styles = createTheme({
  container: {
    flex: 1,
  },
  actionPanel: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: Color.bg1,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Color.graphicBase2,
  },
  webviewContainer: {
    flex: 1,
  },
  title: {
    flex: 1,
    marginHorizontal: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Color.graphicBase2,
    paddingHorizontal: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
});
