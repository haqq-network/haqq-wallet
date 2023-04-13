import React, {useCallback, useMemo, useRef, useState} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {Share} from 'react-native';
import WebView from 'react-native-webview';

import {
  Web3Browser,
  Web3BrowserHelper,
  WindowInfoEvent,
} from '@app/components/web3-browser';
import {getOriginFromUrl} from '@app/components/web3-browser/web3-browser-utils';
import {awaitForProvider} from '@app/helpers/await-for-provider';
import {useTypedNavigation, useTypedRoute, useUser} from '@app/hooks';
import {useWeb3BrowserSessions} from '@app/hooks/use-web3-browser-sessions';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Web3BrowserBookmark} from '@app/models/web3-browser-bookmark';
import {Web3BrowserSearchHistory} from '@app/models/web3-browser-search-history';
import {Web3BrowserSession} from '@app/models/web3-browser-session';

export const Web3BrowserScreen = () => {
  const {url} = useTypedRoute<'web3browser'>().params;
  const navigation = useTypedNavigation();
  const [showActionMenu, setShowActionMenu] = useState(false);
  const toggleActionMenu = useCallback(
    () => setShowActionMenu(!showActionMenu),
    [showActionMenu],
  );
  const sessions = useWeb3BrowserSessions();
  const webviewRef = useRef<WebView>(null);
  const helper = useRef<Web3BrowserHelper>(
    new Web3BrowserHelper({webviewRef, initialUrl: url}),
  ).current;
  const user = useUser();
  const userProvider = useMemo(
    () => Provider.getProvider(user.providerId),
    [user.providerId],
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
    const providers = Provider.getProviders();
    const session = Web3BrowserSession.getByOrigin(helper.origin);

    const initialProviderId = Provider.getByChainIdHex(
      session?.selectedChainIdHex!,
    )?.id;

    const providerId = await awaitForProvider({
      providers,
      initialProviderId: initialProviderId!,
      title: I18N.networks,
    });
    const provider = Provider.getProvider(providerId);
    if (provider) {
      helper.changeChainId(provider.ethChainIdHex);
    }
  }, [helper]);

  const onPressHome = useCallback(() => {
    setShowActionMenu(false);
    navigation.reset({
      routes: [{name: 'home', params: {screen: 'homeBrowser'}}],
    });
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
      }
    },
    [],
  );
  const onPressRefresh = useCallback(() => {
    setShowActionMenu(false);
    webviewRef.current?.reload?.();
  }, []);
  const onPressCopyLink = useCallback(() => {
    setShowActionMenu(false);
    Clipboard.setString(helper.currentUrl);
  }, [helper.currentUrl]);
  const onPressDisconnect = useCallback(() => {
    setShowActionMenu(false);
    helper.disconnectAccount();
  }, [helper]);
  const onPressShare = useCallback(() => {
    setShowActionMenu(false);
    Share.share({url: helper.currentUrl});
  }, [helper]);

  const addSitiToSearchHistory = useCallback(
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
      webviewRef={webviewRef}
      helper={helper}
      initialUrl={url}
      sessions={sessions}
      showActionMenu={showActionMenu}
      userProvider={userProvider!}
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
      addSitiToSearchHistory={addSitiToSearchHistory}
    />
  );
};
