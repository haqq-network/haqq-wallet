import React, {useEffect, useMemo, useRef, useState} from 'react';

import {StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

import {WebViewLogger} from '@app/helpers/webview-logger';

import {InpageBridgeWeb3, WebViewEventsEnum, WindowInfoEvent} from './scripts';
import {Web3BrowserHelper} from './web3-browser-helper';
import {WebViewUserAgent} from './web3-browser-utils';

import {Button, ButtonVariant} from '../ui';

export interface Web3BrowserProps {
  initialUrl: string;
}

export const Web3Browser = ({initialUrl}: Web3BrowserProps) => {
  const [inpageBridgeWeb3, setInpageBridgeWeb3] = useState('');
  const webviewRef = useRef<WebView>(null);
  const helper = useRef<Web3BrowserHelper>(
    new Web3BrowserHelper({webviewRef, initialUrl}),
  ).current;

  const injectedJSBeforeContentLoaded = useMemo(
    () =>
      `
      ${WebViewLogger.script}
      ${inpageBridgeWeb3}
      console.log('ethereum loaded:', !!window.ethereum);
      true;`,
    [inpageBridgeWeb3],
  );

  useEffect(() => {
    InpageBridgeWeb3.loadScript().then(script => {
      setInpageBridgeWeb3(script);
    });

    helper?.on(WebViewEventsEnum.WINDOW_INFO, (event: WindowInfoEvent) => {
      console.log('WINDOW_INFO', event);
    });

    return () => {
      helper.dispose();
    };
  }, [helper]);

  if (!inpageBridgeWeb3) {
    return null;
  }

  const onMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      event.persist();
      const isLogHandled = WebViewLogger.handleEvent(event, 'Web3Browser');
      if (isLogHandled) {
        return;
      }

      const isMessageHandled = await responseToEthJRPC({
        event,
        webviewRef,
        getResult: async ({method}) => {
          switch (method) {
            case 'metamask_getProviderState': {
              const provider = Provider.getProvider(user.providerId);
              const networkVersion = provider?.cosmosChainId?.split('-')[1];
              const accounts = Wallet.getAllVisible().map(
                wallet => wallet.accountId,
              );
              return {
                isMetaMask: true,
                isConnected: true,
                isUnlocked: true,
                accounts,
                chainId: '0x' + provider?.ethChainId!.toString(16),
                networkVersion: networkVersion,
              };
            }
            case 'eth_requestAccounts': {
              const wallets = Wallet.getAllVisible();
              const account = await awaitForWallet(wallets, I18N.selectAccount);
              return [account];
            }
            case 'eth_chainId': {
              const provider = Provider.getProvider(user.providerId);
              return provider?.ethChainId;
            }
            case 'eth_accounts': {
              const accounts = Wallet.getAllVisible().map(
                wallet => wallet.accountId,
              );
              return accounts;
            }
          }
        },
      });

      if (!isMessageHandled) {
        console.log('⚪️ onMessage', event?.nativeEvent?.data);
      }
    },
    [user.providerId],
  );

  if (!inpageBridgeWeb3) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Button
        variant={ButtonVariant.contained}
        title="disconnect"
        onPress={() => {
          helper.disconnectAccount();
        }}
      />
      <WebView
        // @ts-ignore
        sendCookies
        useWebkit
        javascriptEnabled
        allowsInlineMediaPlayback
        dataDetectorTypes={'all'}
        originWhitelist={['*']}
        ref={webviewRef}
        userAgent={WebViewUserAgent}
        onMessage={helper.handleMessage}
        onLoad={helper.onLoad}
        onShouldStartLoadWithRequest={helper.onShouldStartLoadWithRequest}
        source={{uri: initialUrl}}
        decelerationRate={'normal'}
        testID={'web3-browser-webview'}
        applicationNameForUserAgent={'HAQQ Wallet'}
        injectedJavaScriptBeforeContentLoaded={injectedJSBeforeContentLoaded}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
