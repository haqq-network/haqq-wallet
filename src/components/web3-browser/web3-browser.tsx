// @refresh reset
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import WebView, {WebViewProps} from 'react-native-webview';
import {
  WebViewNavigation,
  WebViewNavigationEvent,
} from 'react-native-webview/lib/WebViewTypes';

import {DEBUG_VARS} from '@app/debug-vars';
import {createTheme} from '@app/helpers';
import {WebViewLogger} from '@app/helpers/webview-logger';
import {useLayout} from '@app/hooks/use-layout';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {Web3BrowserBookmark} from '@app/models/web3-browser-bookmark';
import {Web3BrowserSearchHistory} from '@app/models/web3-browser-search-history';
import {Web3BrowserSession} from '@app/models/web3-browser-session';

import {
  InpageBridgeWeb3,
  WebViewEventsEnum,
  WebViewEventsJS,
  WindowInfoEvent,
} from './scripts';
import {Web3BrowserActionMenu} from './web3-browser-action-menu';
import {
  Web3BrowserHeader,
  Web3BrowserPressHeaderEvent,
} from './web3-browser-header';
import {Web3BrowserHelper} from './web3-browser-helper';

import {
  WebViewUserAgent,
  clearUrl,
  getOriginFromUrl,
} from '../../helpers/web3-browser-utils';
import {BrowserError} from '../browser-error';

export interface Web3BrowserProps {
  initialUrl: string;
  webviewRef: React.RefObject<WebView<{}>>;
  helper: Web3BrowserHelper;
  sessions: Realm.Results<Web3BrowserSession>;
  bookmarks: Realm.Results<Web3BrowserBookmark>;
  showActionMenu: boolean;
  userProvider: Provider;

  onPressHeaderUrl(event: Web3BrowserPressHeaderEvent): void;

  toggleActionMenu(): void;

  onPressHeaderWallet(accountId: string): void;

  onPressGoBack(): void;

  onPressGoForward(): void;

  onPressMore(): void;

  onPressProviders(): void;

  onPressHome(): void;

  onPressRefresh(): void;

  onPressCopyLink(): void;

  onPressDisconnect(): void;

  onPressShare(): void;

  onPressAddBookmark(windowInfo: WindowInfoEvent['payload']): void;

  onPressRemoveBookmark(url: string): void;

  addSiteToSearchHistory(windowInfo: WindowInfoEvent['payload']): void;
}

export const Web3Browser = ({
  initialUrl,
  helper,
  webviewRef,
  sessions,
  bookmarks,
  showActionMenu,
  userProvider,
  toggleActionMenu,
  onPressHeaderWallet,
  onPressHeaderUrl,
  onPressGoBack,
  onPressGoForward,
  onPressMore,
  onPressProviders,
  onPressHome,
  onPressRefresh,
  onPressCopyLink,
  onPressDisconnect,
  onPressShare,
  onPressAddBookmark,
  onPressRemoveBookmark,
  addSiteToSearchHistory,
}: Web3BrowserProps) => {
  const [inpageBridgeWeb3, setInpageBridgeWeb3] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>();
  const [windowInfo, setWindowInfo] = useState<WindowInfoEvent['payload']>();
  const [webviewNavigationData, setWebviewNavigationData] =
    useState<WebViewNavigation>();
  const addedToSearchHistory = useRef(false);
  const [moreIconLayout, onMoreIconLayout] = useLayout();
  const insets = useSafeAreaInsets();
  const currentSession = useMemo(
    () =>
      sessions.filtered(
        `origin = '${getOriginFromUrl(
          webviewNavigationData?.url || initialUrl,
        )}'`,
      )[0],
    [initialUrl, sessions, webviewNavigationData?.url],
  );
  const walletFromSession = useMemo(
    () => Wallet.getById(currentSession?.selectedAccount),
    [currentSession],
  );
  const wallet = selectedWallet || walletFromSession;
  const siteUrl = useMemo(
    () =>
      webviewNavigationData?.url ||
      windowInfo?.url ||
      helper.currentUrl ||
      initialUrl,
    [
      helper.currentUrl,
      initialUrl,
      webviewNavigationData?.url,
      windowInfo?.url,
    ],
  );
  const isSiteInBookmarks = useMemo(
    () => !!bookmarks?.filtered(`url = '${siteUrl}'`)?.[0]?.id,
    [siteUrl, bookmarks],
  );

  const chainId = useMemo(
    () => currentSession?.selectedChainIdHex || userProvider?.ethChainIdHex,
    [currentSession?.selectedChainIdHex, userProvider?.ethChainIdHex],
  );

  const currentProvider = useMemo(
    () => Provider.getByChainIdHex(chainId!),
    [chainId],
  );

  const injectedJSBeforeContentLoaded = useMemo(
    () =>
      `
      ${WebViewLogger.script}
      ${inpageBridgeWeb3}
      ${WebViewEventsJS.getWindowInformation}
      console.log('ethereum loaded:', !!window.ethereum);
      true;`,
    [inpageBridgeWeb3],
  );

  const onContentProcessDidTerminate = useCallback(() => {
    webviewRef?.current?.reload?.();
  }, [webviewRef]);

  const handlePressAddBookmark = useCallback(() => {
    const url =
      webviewNavigationData?.url || windowInfo?.url || helper.currentUrl;
    onPressAddBookmark?.({
      ...windowInfo,
      url,
      title: webviewNavigationData?.title || windowInfo?.title || clearUrl(url),
    });
  }, [
    helper.currentUrl,
    onPressAddBookmark,
    webviewNavigationData?.title,
    webviewNavigationData?.url,
    windowInfo,
  ]);

  const handlePressRemoveBookmark = useCallback(() => {
    const url =
      webviewNavigationData?.url || windowInfo?.url || helper.currentUrl;
    onPressRemoveBookmark?.(url);
  }, [
    helper.currentUrl,
    onPressRemoveBookmark,
    webviewNavigationData?.url,
    windowInfo,
  ]);

  const onLoad = useCallback(
    (event: WebViewNavigationEvent) => {
      helper.onLoad(event);
      setWebviewNavigationData(event.nativeEvent);

      if (event?.nativeEvent?.navigationType === 'backforward') {
        webviewRef?.current?.reload();
      }
    },
    [helper, webviewRef],
  );

  const renderError = useCallback(
    (...args: Parameters<NonNullable<WebViewProps['renderError']>>) => (
      <BrowserError reason={args[2]} />
    ),
    [],
  );

  useEffect(() => {
    InpageBridgeWeb3.loadScript().then(script => {
      setInpageBridgeWeb3(script);
    });

    helper?.on(WebViewEventsEnum.WINDOW_INFO, (event: WindowInfoEvent) => {
      setWindowInfo(event.payload);
      if (
        !addedToSearchHistory.current &&
        !Web3BrowserSearchHistory.getByUrl(event.payload.url)
      ) {
        addSiteToSearchHistory(event.payload);
        addedToSearchHistory.current = true;
      }
    });

    helper?.on(WebViewEventsEnum.ACCOUNTS_CHANGED, ([accountId]: string[]) => {
      if (accountId) {
        const foundWallet = Wallet.getById(accountId);
        setSelectedWallet(foundWallet);
      } else {
        setSelectedWallet(null);
      }
    });

    return () => {
      helper.dispose();
    };
  }, [addSiteToSearchHistory, helper]);

  if (!inpageBridgeWeb3) {
    return null;
  }

  return (
    <View style={[styles.container, {top: insets.top}]}>
      <Web3BrowserHeader
        wallet={wallet!}
        webviewNavigationData={webviewNavigationData!}
        siteUrl={siteUrl}
        onPressMore={onPressMore}
        onMoreIconLayout={onMoreIconLayout}
        onPressGoBack={onPressGoBack}
        onPressGoForward={onPressGoForward}
        onPressHeaderUrl={onPressHeaderUrl}
        onPressHeaderWallet={onPressHeaderWallet}
      />
      <View style={styles.webviewContainer}>
        <WebView
          incognito={DEBUG_VARS.enableWeb3BrowserIncognito}
          // @ts-ignore
          sendCookies
          useWebkit
          javascriptEnabled
          allowsInlineMediaPlayback
          dataDetectorTypes={'all'}
          originWhitelist={['*']}
          containerStyle={{paddingBottom: insets.top}}
          ref={webviewRef}
          userAgent={WebViewUserAgent}
          onMessage={helper.handleMessage}
          onLoad={onLoad}
          onLoadEnd={helper.onLoadEnd}
          onShouldStartLoadWithRequest={helper.onShouldStartLoadWithRequest}
          renderError={renderError}
          onContentProcessDidTerminate={onContentProcessDidTerminate}
          source={{uri: initialUrl}}
          decelerationRate={'normal'}
          testID={'web3-browser-webview'}
          applicationNameForUserAgent={'HAQQ Wallet'}
          injectedJavaScriptBeforeContentLoaded={injectedJSBeforeContentLoaded}
        />
      </View>
      <Web3BrowserActionMenu
        wallet={wallet!}
        showActionMenu={showActionMenu}
        currentProvider={currentProvider!}
        currentSession={currentSession}
        moreIconLayout={moreIconLayout}
        isSiteInBookmarks={isSiteInBookmarks}
        toggleActionMenu={toggleActionMenu}
        onPressProviders={onPressProviders}
        onPressHome={onPressHome}
        onPressRefresh={onPressRefresh}
        onPressCopyLink={onPressCopyLink}
        onPressDisconnect={onPressDisconnect}
        onPressShare={onPressShare}
        onPressAddBookmark={handlePressAddBookmark}
        onPressRemoveBookmark={handlePressRemoveBookmark}
      />
    </View>
  );
};

const styles = createTheme({
  webviewContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
