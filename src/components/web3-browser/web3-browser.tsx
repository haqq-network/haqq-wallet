// @refresh reset
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {SafeAreaView, View} from 'react-native';
import WebView, {WebViewProps} from 'react-native-webview';
import {
  FileDownloadEvent,
  WebViewNavigation,
  WebViewNavigationEvent,
} from 'react-native-webview/lib/WebViewTypes';

import {DEBUG_VARS} from '@app/debug-vars';
import {createTheme} from '@app/helpers';
import {WebViewLogger} from '@app/helpers/webview-logger';
import {useLayout} from '@app/hooks/use-layout';
import {usePrevious} from '@app/hooks/use-previous';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {Web3BrowserBookmark} from '@app/models/web3-browser-bookmark';
import {Web3BrowserSearchHistory} from '@app/models/web3-browser-search-history';
import {Web3BrowserSession} from '@app/models/web3-browser-session';
import {getUserAgent} from '@app/services/version';

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

import {clearUrl, getOriginFromUrl} from '../../helpers/web3-browser-utils';
import {BrowserError} from '../browser-error';

export interface Web3BrowserProps {
  initialUrl: string;
  webviewRef: React.RefObject<WebView<{}>>;
  helper: Web3BrowserHelper;
  sessions: Realm.Results<Web3BrowserSession>;
  bookmarks: Realm.Results<Web3BrowserBookmark>;
  showActionMenu: boolean;
  popup?: boolean;
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

  onPressClose(): void;

  onPressAddBookmark(windowInfo: WindowInfoEvent['payload']): void;

  onPressRemoveBookmark(url: string): void;

  onFileDownload(event: FileDownloadEvent): void;

  addSiteToSearchHistory(windowInfo: WindowInfoEvent['payload']): void;
}

export const Web3Browser = ({
  popup,
  initialUrl,
  helper,
  webviewRef,
  sessions,
  bookmarks,
  showActionMenu,
  userProvider,
  onPressClose,
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
  onFileDownload,
}: Web3BrowserProps) => {
  const userAgent = useRef(getUserAgent()).current;
  const [inpageBridgeWeb3, setInpageBridgeWeb3] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string | undefined>();
  const [windowInfo, setWindowInfo] = useState<WindowInfoEvent['payload']>();
  const [webviewNavigationData, setWebviewNavigationData] =
    useState<WebViewNavigation>();
  const addedToSearchHistory = useRef(false);
  const [moreIconLayout, onMoreIconLayout] = useLayout();
  const ContainerComponent = useMemo(
    () => (popup ? View : SafeAreaView),
    [popup],
  );
  const currentSession = useMemo(() => {
    if (!sessions?.length) {
      return;
    }
    return sessions.filtered(
      'origin = $0',
      getOriginFromUrl(webviewNavigationData?.url || initialUrl),
    )[0];
  }, [initialUrl, sessions, webviewNavigationData?.url]);
  const prevSession = usePrevious(currentSession);

  useEffect(() => {
    if (prevSession && !currentSession) {
      helper.disconnectAccount();
      webviewRef.current?.reload();
    }
  }, [currentSession, helper, prevSession, webviewRef]);

  useEffect(() => {
    // if saved account in session removed from wallet
    if (
      currentSession?.selectedAccount &&
      !Wallet.getById(currentSession?.selectedAccount)
    ) {
      helper.disconnectAccount();
      webviewRef.current?.reload();
    }
  }, [currentSession, helper, webviewRef]);

  const walletAddress = selectedAccount || currentSession?.selectedAccount;
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
      if(window.ethereum) {
        window.ethereum.isMetaMask = false;
        window.ethereum.isHaqqWallet = true;
      }
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
        setSelectedAccount(foundWallet?.address);
      } else {
        setSelectedAccount(undefined);
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
    <ContainerComponent style={[styles.container, !popup && styles.marginTop]}>
      <Web3BrowserHeader
        walletAddress={walletAddress}
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
          ref={webviewRef}
          userAgent={userAgent}
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
          onFileDownload={onFileDownload}
        />
      </View>
      <Web3BrowserActionMenu
        walletAddress={walletAddress}
        showActionMenu={showActionMenu}
        currentProvider={currentProvider!}
        currentSessionOrigin={currentSession?.origin}
        moreIconLayout={moreIconLayout}
        isSiteInBookmarks={isSiteInBookmarks}
        popup={popup}
        onPressClose={onPressClose}
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
    </ContainerComponent>
  );
};

const styles = createTheme({
  webviewContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  marginTop: {
    marginTop: 10,
  },
});
