// @refresh reset
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {observer} from 'mobx-react';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import {
  WebViewNavigation,
  WebViewNavigationEvent,
} from 'react-native-webview/lib/WebViewTypes';

import {createTheme} from '@app/helpers';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {useLayout} from '@app/hooks/use-layout';
import {usePrevious} from '@app/hooks/use-previous';
import {useWebViewSharedProps} from '@app/hooks/use-webview-shared-props';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {Web3BrowserBookmark} from '@app/models/web3-browser-bookmark';
import {Web3BrowserSearchHistory} from '@app/models/web3-browser-search-history';
import {Web3BrowserSession} from '@app/models/web3-browser-session';
import {IS_IOS} from '@app/variables/common';
import {EIP6963ProviderInfo} from '@app/variables/EIP6963';

import {
  InpageBridgeWeb3,
  WebViewEventsEnum,
  WebViewEventsJS,
  WindowInfoEvent,
} from './scripts';
import {Web3BrowserActionMenu} from './web3-browser-action-menu';
import {WebViewContainer} from './web3-browser-container';
import {
  Web3BrowserHeader,
  Web3BrowserPressHeaderEvent,
} from './web3-browser-header';
import {Web3BrowserHelper} from './web3-browser-helper';

import {
  clearUrl,
  detectDeeplink,
  getOriginFromUrl,
} from '../../helpers/web3-browser-utils';
import {CustomHeaderWebView} from '../custom-header-webview';

export interface Web3BrowserProps {
  initialUrl: string;
  webviewRef: React.RefObject<WebView<{}>>;
  helper: Web3BrowserHelper;
  sessions: Realm.Results<Web3BrowserSession>;
  bookmarks: Realm.Results<Web3BrowserBookmark>;
  showActionMenu: boolean;
  popup?: boolean;
  focused: boolean;

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

  onPressPrivacy(): void;

  onPressAddBookmark(windowInfo: WindowInfoEvent['payload']): void;

  onPressRemoveBookmark(url: string): void;

  addSiteToSearchHistory(windowInfo: WindowInfoEvent['payload']): void;
}

export const Web3Browser = observer(
  ({
    popup,
    initialUrl,
    helper,
    webviewRef,
    sessions,
    bookmarks,
    showActionMenu,
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
    onPressPrivacy,
  }: Web3BrowserProps) => {
    const [inpageBridgeWeb3, setInpageBridgeWeb3] = useState('');
    const [selectedAccount, setSelectedAccount] = useState<
      string | undefined
    >();
    const [windowInfo, setWindowInfo] = useState<WindowInfoEvent['payload']>();
    const [webviewNavigationData, setWebviewNavigationData] =
      useState<WebViewNavigation>();
    const addedToSearchHistory = useRef(false);
    const [moreIconLayout, onMoreIconLayout] = useLayout();

    const insets = useSafeAreaInsets();
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

    const onPressRefreshHandler = useCallback(async () => {
      onPressRefresh?.();
      setInpageBridgeWeb3('');
      const script = await InpageBridgeWeb3.loadScript();
      setInpageBridgeWeb3(script);
    }, []);

    useEffect(() => {
      if (prevSession && !currentSession) {
        helper.disconnectAccount();
        onPressRefreshHandler();
      }
    }, [
      currentSession,
      helper,
      prevSession,
      webviewRef,
      onPressRefreshHandler,
    ]);

    useEffect(() => {
      // if saved account in session removed from wallet
      if (
        currentSession?.selectedAccount &&
        !Wallet.getById(currentSession?.selectedAccount)
      ) {
        helper.disconnectAccount();
        onPressRefreshHandler();
      }
    }, [currentSession, helper, webviewRef, onPressRefreshHandler]);

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
      () =>
        currentSession?.selectedChainIdHex ||
        Provider.selectedProvider.ethChainIdHex,
      [
        currentSession?.selectedChainIdHex,
        Provider.selectedProvider.ethChainIdHex,
      ],
    );

    const currentProvider = useMemo(
      () => Provider.getByChainIdHex(chainId!),
      [chainId],
    );

    const injectedJSBeforeContentLoaded = useMemo(
      () =>
        `
     function init() {
        if(window?.ethereum?.isHaqqWallet || window?.keplr?.isHaqqWallet){
          return;
        }
        ${inpageBridgeWeb3}
        console.log('ethereum loaded:', !!window.ethereum);
        console.log('keplr loaded:', !!window.keplr);

        if(window.ethereum) {
          window.ethereum.isHaqqWallet = true;
          function announceProvider() {
            const info = ${JSON.stringify(EIP6963ProviderInfo)};
            window.dispatchEvent(
              new CustomEvent("eip6963:announceProvider", {
                detail: Object.freeze({ info, provider: window.ethereum }),
              })
            );
          }
        
          window.addEventListener(
            "eip6963:requestProvider",
            (event) => {
              announceProvider();
            }
          );
        
          announceProvider();
        }
        if(window.keplr){
          window.keplr.isHaqqWallet = true;
          window.__HAQQ_KEPLR_DEV__ = ${__DEV__};
        }
      };
      ${
        IS_IOS
          ? 'init();'
          : 'document.addEventListener("DOMContentLoaded", init);'
      }
      ${WebViewEventsJS.getWindowInformation}
      true;`,
      [inpageBridgeWeb3],
    );

    const onContentProcessDidTerminate = useCallback(() => {
      onPressRefreshHandler();
    }, [webviewRef, onPressRefreshHandler]);

    const handlePressAddBookmark = useCallback(() => {
      const url =
        webviewNavigationData?.url || windowInfo?.url || helper.currentUrl;
      onPressAddBookmark?.({
        ...windowInfo,
        url,
        title:
          webviewNavigationData?.title || windowInfo?.title || clearUrl(url),
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
        if (detectDeeplink(event.nativeEvent.url)) {
          webviewRef.current?.stopLoading();
          return;
        }

        helper.onLoad(event);
        setWebviewNavigationData(event.nativeEvent);

        if (
          event?.nativeEvent?.navigationType === 'backforward' &&
          !event.nativeEvent?.loading
        ) {
          onPressRefreshHandler();
        }
      },
      [helper, webviewRef, onPressRefreshHandler],
    );

    const onNavigationStateChange = useCallback(
      (navState: WebViewNavigation) => {
        if (detectDeeplink(navState.url)) {
          return;
        }
        setWebviewNavigationData(navState);
      },
      [],
    );

    useAndroidBackHandler(() => {
      if (webviewRef.current) {
        if (webviewNavigationData?.canGoBack) {
          webviewRef.current.goBack();
          return true;
        } else {
          return false;
        }
      }
      return false;
    }, [webviewNavigationData?.canGoBack, webviewRef]);

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

      helper?.on(
        WebViewEventsEnum.ACCOUNTS_CHANGED,
        ([accountId]: string[]) => {
          if (accountId) {
            const foundWallet = Wallet.getById(accountId);
            setSelectedAccount(foundWallet?.address);
          } else {
            setSelectedAccount(undefined);
          }
        },
      );

      return () => {
        helper.dispose();
      };
    }, [addSiteToSearchHistory, helper]);

    const webViewDefaultProps = useWebViewSharedProps(
      webviewRef,
      {
        onMessage: helper.handleMessage,
        injectedJavaScriptBeforeContentLoaded: injectedJSBeforeContentLoaded,
      },
      [injectedJSBeforeContentLoaded],
    );

    if (!inpageBridgeWeb3) {
      return null;
    }

    return (
      <View
        style={[
          styles.container,
          IS_IOS && !popup && {paddingTop: insets.top},
          IS_IOS && popup && {paddingBottom: insets.bottom},
        ]}>
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
          popup={popup ?? false}
          onPressClose={onPressClose}
        />

        <WebViewContainer webviewRef={webviewRef}>
          <CustomHeaderWebView
            {...webViewDefaultProps}
            browserType="web3"
            ref={webviewRef}
            onLoad={onLoad}
            onLoadEnd={helper.onLoadEnd}
            style={styles.webview}
            scalesPageToFit
            containerStyle={styles.webview}
            onShouldStartLoadWithRequest={helper.onShouldStartLoadWithRequest}
            onContentProcessDidTerminate={onContentProcessDidTerminate}
            source={{uri: initialUrl}}
            onNavigationStateChange={onNavigationStateChange}
          />
        </WebViewContainer>

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
          onPressRefresh={onPressRefreshHandler}
          onPressCopyLink={onPressCopyLink}
          onPressDisconnect={onPressDisconnect}
          onPressShare={onPressShare}
          onPressAddBookmark={handlePressAddBookmark}
          onPressRemoveBookmark={handlePressRemoveBookmark}
          onPressPrivacy={onPressPrivacy}
        />
      </View>
    );
  },
);

const styles = createTheme({
  webview: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
