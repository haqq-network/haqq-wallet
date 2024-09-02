import React, {useCallback, useRef, useState} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {useFocusEffect} from '@react-navigation/native';
import {Share} from 'react-native';
import WebView from 'react-native-webview';

import {Loading} from '@app/components/ui';
import {
  Web3Browser,
  Web3BrowserHelper,
  WebViewEventsEnum,
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
import {VariablesBool} from '@app/models/variables-bool';
import {Wallet} from '@app/models/wallet';
import {Web3BrowserBookmark} from '@app/models/web3-browser-bookmark';
import {Web3BrowserSearchHistory} from '@app/models/web3-browser-search-history';
import {Web3BrowserSession} from '@app/models/web3-browser-session';
import {BrowserStackParamList, BrowserStackRoutes} from '@app/route-types';
import {sendNotification} from '@app/services';

export const Web3BrowserScreen = () => {
  const [focused, setFocused] = useState(false);
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
  const helper = useRef<Web3BrowserHelper | null>(
    new Web3BrowserHelper({webviewRef, initialUrl: url}),
  );
  const [isLoading, setLoading] = useState(true);
  const onPressHeaderUrl = useCallback(
    ({}: Web3BrowserPressHeaderEvent) => {
      if (app.isTesterMode) {
        navigation.navigate('browserSearchPage', {
          initialSearchText: helper.current?.currentUrl || url,
        });
      }
    },
    [helper, navigation, url],
  );

  const onPressHeaderWallet = useCallback(
    async (accountId: string) => {
      const wallets = Wallet.getAllVisible();
      const selectedAccount = await awaitForWallet({
        wallets,
        title: I18N.selectAccount,
        autoSelectWallet: false,
        initialAddress: accountId,
        hideBalance: true,
      });
      helper.current?.changeAccount?.(selectedAccount);
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
    const session = Web3BrowserSession.getByOrigin(helper.current?.origin!);

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
      helper.current?.changeChainId(provider.ethChainIdHex);
    }
  }, [helper]);

  const onPressHome = useCallback(() => {
    setShowActionMenu(false);
    navigation.goBack();
  }, [navigation]);

  const onPressClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onPressPrivacy = useCallback(() => {
    navigation.navigate('browserPrivacyPopupStack', {screen: 'browserPrivacy'});
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
    Clipboard.setString(helper.current?.currentUrl!);
    sendNotification(I18N.browserToastLinkCopied);
  }, [helper]);
  const onPressDisconnect = useCallback(() => {
    setShowActionMenu(false);
    helper.current?.disconnectAccount?.();
  }, [helper]);
  const onPressShare = useCallback(() => {
    setShowActionMenu(false);
    Share.share({url: helper.current?.currentUrl!});
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

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const currentUrl = helper.current?.currentUrl || url;
      const isClearHistory = VariablesBool.get(WebViewEventsEnum.CLEAR_HISTORY);
      const isClearCache = VariablesBool.get(WebViewEventsEnum.CLEAR_CACHE);
      Logger.log('Web3BrowserScreen:reset', {
        isClearCache,
        isClearHistory,
        currentUrl,
      });
      try {
        if (isClearHistory && helper.current) {
          webviewRef?.current?.clearHistory?.();
          VariablesBool.set(WebViewEventsEnum.CLEAR_HISTORY, false);
        }

        if (isClearCache && helper.current) {
          helper.current?.disconnectAccount?.();
          helper.current?.dispose?.();
          webviewRef?.current?.clearCache?.(true);
          webviewRef?.current?.clearFormData?.();
          webviewRef?.current?.clearHistory?.();
          helper.current = null;
          helper.current = new Web3BrowserHelper({
            webviewRef,
            initialUrl: currentUrl,
          });
        }
        VariablesBool.set(WebViewEventsEnum.CLEAR_CACHE, false);
      } catch (err) {
        Logger.captureException(err, 'Web3BrowserScreen:reset', {
          currentUrl,
          isClearHistory,
          isClearCache,
        });
      } finally {
        setLoading(false);
      }
    }, [helper, webviewRef]),
  );

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => {
        setFocused(false);
      };
    }, [setFocused]),
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Web3Browser
      popup={popup}
      webviewRef={webviewRef}
      helper={helper.current!}
      initialUrl={url}
      sessions={sessions}
      bookmarks={bookmarks}
      showActionMenu={showActionMenu}
      focused={focused}
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
      onPressPrivacy={onPressPrivacy}
    />
  );
};
