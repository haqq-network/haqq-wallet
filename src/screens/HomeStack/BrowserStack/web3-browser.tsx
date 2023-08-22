import React, {memo, useCallback, useMemo, useRef, useState} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {Share} from 'react-native';
import WebView from 'react-native-webview';

import {
  Web3Browser,
  Web3BrowserHelper,
  WindowInfoEvent,
} from '@app/components/web3-browser';
import {Web3BrowserPressHeaderEvent} from '@app/components/web3-browser/web3-browser-header';
import {app} from '@app/contexts';
import {awaitForWallet} from '@app/helpers';
import {awaitForProvider} from '@app/helpers/await-for-provider';
import {getOriginFromUrl} from '@app/helpers/web3-browser-utils';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useWeb3BrowserBookmark} from '@app/hooks/use-web3-browser-bookmark';
import {useWeb3BrowserSessions} from '@app/hooks/use-web3-browser-sessions';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {Web3BrowserBookmark} from '@app/models/web3-browser-bookmark';
import {Web3BrowserSearchHistory} from '@app/models/web3-browser-search-history';
import {Web3BrowserSession} from '@app/models/web3-browser-session';
import {
  BrowserStackParamList,
  BrowserStackRoutes,
} from '@app/screens/HomeStack/BrowserStack';
import {sendNotification} from '@app/services';

export const Web3BrowserScreen = memo(() => {
  const {url, popup} = useTypedRoute<
    BrowserStackParamList,
    BrowserStackRoutes.Web3browser
  >().params;
  const navigation = useTypedNavigation();
  const [showActionMenu, setShowActionMenu] = useState(false);
  const toggleActionMenu = useCallback(
    () => setShowActionMenu(!showActionMenu),
    [showActionMenu],
  );
  const sessions = useWeb3BrowserSessions();
  const bookmarks = useWeb3BrowserBookmark();
  const webviewRef = useRef<WebView>(null);
  const helper = useRef<Web3BrowserHelper>(
    new Web3BrowserHelper({webviewRef, initialUrl: url}),
  ).current;
  const userProvider = useMemo(() => Provider.getById(app.providerId), []);

  const onPressHeaderUrl = useCallback(({}: Web3BrowserPressHeaderEvent) => {
    // navigation.navigate(BrowserStackRoutes.BrowserSearchPage, {
    //   initialSearchText: siteUrl || clearSiteUrl,
    // });
  }, []);

  const onPressHeaderWallet = useCallback(
    async (accountId: string) => {
      const wallets = Wallet.getAllVisible();
      const selectedAccount = await awaitForWallet({
        wallets,
        title: I18N.selectAccount,
        autoSelectWallet: false,
        initialAddress: accountId,
      });
      helper.changeAccount(selectedAccount);
    },
    [helper],
  );

  const onPressGoBack = useCallback(() => {
    setShowActionMenu(false);
    webviewRef.current?.goBack?.();
  }, []);

  const onPressGoForward = useCallback(() => {
    setShowActionMenu(false);
    webviewRef.current?.goForward?.();
  }, []);

  const onPressMore = useCallback(() => {
    setShowActionMenu(false);
    setShowActionMenu(!showActionMenu);
  }, [showActionMenu]);

  const onPressProviders = useCallback(async () => {
    setShowActionMenu(false);
    const providers = Provider.getAll();
    const session = Web3BrowserSession.getByOrigin(helper.origin);

    const initialProviderId = Provider.getByChainIdHex(
      session?.selectedChainIdHex!,
    )?.id;

    const providerId = await awaitForProvider({
      providers,
      initialProviderId: initialProviderId!,
      title: I18N.networks,
    });
    const provider = Provider.getById(providerId);
    if (provider) {
      helper.changeChainId(provider.ethChainIdHex);
    }
  }, [helper]);

  const onPressHome = useCallback(() => {
    setShowActionMenu(false);
    navigation.goBack();
  }, [navigation]);

  const onPressClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onPressAddBookmark = useCallback(
    (windowInfo: WindowInfoEvent['payload']) => {
      setShowActionMenu(false);
      if (windowInfo && !Web3BrowserBookmark.getByUrl(windowInfo.url)) {
        Web3BrowserBookmark.create({
          ...windowInfo,
          title: windowInfo?.title
            ? windowInfo?.title
            : getOriginFromUrl(windowInfo.url),
        });
        sendNotification(I18N.browserToastAddedToBookmarks);
      }
    },
    [],
  );

  const onPressRemoveBookmark = useCallback((bookmarkUrl: string) => {
    setShowActionMenu(false);
    const foundBookbark = Web3BrowserBookmark.getByUrl(bookmarkUrl);
    if (foundBookbark?.id) {
      Web3BrowserBookmark.remove(foundBookbark.id);
      sendNotification(I18N.browserToastRemoveFromBookmarks);
    }
  }, []);

  const onPressRefresh = useCallback(() => {
    setShowActionMenu(false);
    webviewRef.current?.reload?.();
  }, []);
  const onPressCopyLink = useCallback(() => {
    setShowActionMenu(false);
    Clipboard.setString(helper.currentUrl);
    sendNotification(I18N.browserToastLinkCopied);
  }, [helper.currentUrl]);
  const onPressDisconnect = useCallback(() => {
    setShowActionMenu(false);
    helper.disconnectAccount();
  }, [helper]);
  const onPressShare = useCallback(() => {
    setShowActionMenu(false);
    Share.share({url: helper.currentUrl});
  }, [helper]);

  const addSiteToSearchHistory = useCallback(
    (windowInfo: WindowInfoEvent['payload']) => {
      Web3BrowserSearchHistory.create({
        ...windowInfo,
        title: windowInfo.title
          ? windowInfo.title
          : getOriginFromUrl(windowInfo.url),
      });
    },
    [],
  );

  return (
    <Web3Browser
      popup={popup}
      webviewRef={webviewRef}
      helper={helper}
      initialUrl={url}
      sessions={sessions}
      bookmarks={bookmarks}
      showActionMenu={showActionMenu}
      userProvider={userProvider!}
      onPressClose={onPressClose}
      onPressHeaderUrl={onPressHeaderUrl}
      onPressHeaderWallet={onPressHeaderWallet}
      toggleActionMenu={toggleActionMenu}
      onPressGoBack={onPressGoBack}
      onPressGoForward={onPressGoForward}
      onPressMore={onPressMore}
      onPressProviders={onPressProviders}
      onPressHome={onPressHome}
      onPressRefresh={onPressRefresh}
      onPressCopyLink={onPressCopyLink}
      onPressDisconnect={onPressDisconnect}
      onPressShare={onPressShare}
      onPressAddBookmark={onPressAddBookmark}
      onPressRemoveBookmark={onPressRemoveBookmark}
      addSiteToSearchHistory={addSiteToSearchHistory}
    />
  );
});
