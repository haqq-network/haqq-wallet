import React, {useCallback, useMemo, useRef, useState} from 'react';

import {parseUri} from '@walletconnect/utils';
import {ActivityIndicator, SafeAreaView, StyleSheet, View} from 'react-native';
import WebView from 'react-native-webview';
import {
  ShouldStartLoadRequest,
  WebViewNavigation,
  WebViewNavigationEvent,
} from 'react-native-webview/lib/WebViewTypes';

import {Color} from '@app/colors';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {createTheme} from '@app/helpers';
import {getAppHeaders} from '@app/helpers/get-app-headers';
import {getMMPhishingController} from '@app/helpers/get-mm-phishing-controller';
import {
  changeWebViewUrlJS,
  detectDeeplink,
  detectDeeplinkAndNavigate,
  detectDynamicLink,
  detectDynamicLinkAndNavigate,
  showPhishingAlert,
} from '@app/helpers/web3-browser-utils';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {useWebViewSharedProps} from '@app/hooks/use-webview-shared-props';
import {getHostnameFromUrl} from '@app/utils';
import {IS_ANDROID} from '@app/variables/common';

import {CustomHeaderWebView} from './custom-header-webview';
import {Icon, IconButton, IconsName, Spacer, Text} from './ui';
import {Separator} from './ui/separator';
import {WebViewContainer} from './web3-browser/web3-browser-container';

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
  const phishingController = useRef(getMMPhishingController()).current;

  const pageTitle = useMemo(
    () =>
      title ||
      navigationEvent?.title ||
      getHostnameFromUrl(url) ||
      'In-App Browser',
    [navigationEvent?.title, title, url],
  );

  const onContentProcessDidTerminate = useCallback(() => {
    webviewRef?.current?.reload?.();
  }, [webviewRef]);

  const onLoad = useCallback(
    (event: WebViewNavigationEvent) => {
      setNavigationEvent(event.nativeEvent);

      if (
        event?.nativeEvent?.navigationType === 'backforward' &&
        !event.nativeEvent?.loading
      ) {
        webviewRef?.current?.reload();
      }
    },
    [webviewRef],
  );

  const onPressRefresh = useCallback(() => {
    webviewRef?.current?.injectJavaScript?.('window.location.reload();');
    setPageLoading(true);
  }, [webviewRef]);

  const onPressStopLoading = useCallback(() => {
    webviewRef?.current?.stopLoading?.();
    setPageLoading(false);
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

      if (await detectDynamicLinkAndNavigate(nextUrl)) {
        return onPressClose();
      }

      const js = changeWebViewUrlJS(nextUrl);
      webviewRef?.current?.injectJavaScript(js);
    },
    [onPressClose, phishingController, webviewRef],
  );

  const onShouldStartLoadWithRequest = useCallback(
    ({url: nextUrl}: ShouldStartLoadRequest) => {
      if (nextUrl.startsWith('about:') || nextUrl.startsWith('blob:')) {
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

      if (detectDynamicLink(nextUrl)) {
        go(nextUrl);
        return false;
      }

      return true;
    },
    [go, phishingController],
  );

  const onNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    setNavigationEvent(navState);
  }, []);

  useAndroidBackHandler(() => {
    if (webviewRef.current) {
      if (navigationEvent?.canGoBack) {
        webviewRef.current.goBack();
        return true;
      } else {
        return false;
      }
    }
    return false;
  }, [navigationEvent?.canGoBack, webviewRef]);

  const webViewDefaultProps = useWebViewSharedProps(webviewRef);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleContainer}>
        {isPageLoading && (
          <IconButton onPress={onPressStopLoading}>
            <ActivityIndicator size="small" color={Color.graphicSecond2} />
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
      <WebViewContainer webviewRef={webviewRef}>
        <CustomHeaderWebView
          {...webViewDefaultProps}
          browserType="inapp"
          ref={webviewRef}
          onLoad={onLoad}
          onLoadStart={onLoadStart}
          onLoadEnd={onLoadEnd}
          onContentProcessDidTerminate={onContentProcessDidTerminate}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          onNavigationStateChange={onNavigationStateChange}
          source={{uri: url, headers: getAppHeaders('inapp')}}
        />
      </WebViewContainer>
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
