import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {StyleSheet, View} from 'react-native';
import WebView, {WebViewMessageEvent} from 'react-native-webview';

import {awaitForWallet} from '@app/helpers';
import {WebViewLogger} from '@app/helpers/webview-logger';
import {useUser} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';

import {responseToEthJRPC} from './response-to-eth-JRPC';
import {InpageBridgeWeb3} from './scripts';

export interface Web3BrowserProps {
  initialUrl: string;
}

export const Web3Browser = ({initialUrl}: Web3BrowserProps) => {
  const webviewRef = useRef<WebView>(null);
  const [inpageBridgeWeb3, setInpageBridgeWeb3] = useState('');
  const user = useUser();

  const injectedJSBeforeContentLoaded = useMemo(
    () =>
      `
      ${WebViewLogger.script}
      ${inpageBridgeWeb3}
      ${/* SpaUrlChangeListener */ ''}
      console.log('loaded, typeof window.ethereum:', typeof window.ethereum);
      true;`,
    [inpageBridgeWeb3],
  );

  useEffect(() => {
    InpageBridgeWeb3.loadScript().then(script => {
      setInpageBridgeWeb3(script);
    });
  }, []);

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
    <View style={styles.container}>
      <WebView
        // TODO: implement props
        // useWebkit
        // sendCookies
        // javascriptEnabled
        cacheEnabled
        ref={webviewRef}
        onMessage={onMessage}
        originWhitelist={['*']}
        allowsInlineMediaPlayback
        source={{uri: initialUrl}}
        decelerationRate={'normal'}
        testID={'web3-browser-webview'}
        applicationNameForUserAgent={'WebView HAQQ Wallet'}
        injectedJavaScriptBeforeContentLoaded={injectedJSBeforeContentLoaded}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
