import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {useNavigation} from '@react-navigation/native';
import {StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import WebView, {WebViewProps} from 'react-native-webview';

import {WebViewLogger} from '@app/helpers/webview-logger';
import {Wallet} from '@app/models/wallet';

import {
  InpageBridgeWeb3,
  WebViewEventsEnum,
  WebViewEventsJS,
  WindowInfoEvent,
} from './scripts';
import {Web3BrowserHelper} from './web3-browser-helper';
import {WebViewUserAgent} from './web3-browser-utils';

import {BrowserError} from '../browser-error';
import {Button, ButtonSize, ButtonVariant, Spacer, Text} from '../ui';
import {WalletRow, WalletRowTypes} from '../wallet-row';

export interface Web3BrowserProps {
  initialUrl: string;
}

export const Web3Browser = ({initialUrl}: Web3BrowserProps) => {
  const navigation = useNavigation();
  const [inpageBridgeWeb3, setInpageBridgeWeb3] = useState('');
  const webviewRef = useRef<WebView>(null);
  const helper = useRef<Web3BrowserHelper>(
    new Web3BrowserHelper({webviewRef, initialUrl}),
  ).current;
  const [windowInfo, setWindowInfo] = useState<WindowInfoEvent['payload']>();
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>();

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
    });

    helper?.on(WebViewEventsEnum.ACCOUNTS_CHANGED, ([accountId]: string[]) => {
      if (accountId) {
        const wallet = Wallet.getById(accountId);
        setSelectedWallet(wallet);
      } else {
        setSelectedWallet(null);
      }
    });

    return () => {
      helper.dispose();
    };
  }, [helper, setWindowInfo]);

  if (!inpageBridgeWeb3) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <View style={styles.urls}>
          {!!windowInfo?.title && <Text t18>{windowInfo?.title}</Text>}
          {!!windowInfo?.url && <Text t17>{windowInfo?.url}</Text>}
        </View>
        <View style={styles.header}>
          <Spacer width={10} />
          <Button
            title="<"
            size={ButtonSize.small}
            variant={ButtonVariant.contained}
            onPress={() => {
              webviewRef.current?.goBack?.();
            }}
          />
          <Spacer width={10} />
          <Button
            title=">"
            size={ButtonSize.small}
            variant={ButtonVariant.contained}
            onPress={() => {
              webviewRef.current?.goForward?.();
            }}
          />
          <Spacer width={10} />
          <Button
            variant={ButtonVariant.contained}
            size={ButtonSize.small}
            title="disconnect"
            style={styles.disconnect}
            onPress={() => {
              helper.disconnectAccount();
            }}
          />
          <Spacer width={10} />
          {!!selectedWallet && (
            <>
              <WalletRow type={WalletRowTypes.variant3} item={selectedWallet} />
              <Spacer width={10} />
            </>
          )}
          <Button
            title="X"
            variant={ButtonVariant.contained}
            size={ButtonSize.small}
            onPress={navigation.goBack}
          />
          <Spacer width={10} />
        </View>
      </View>
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
        renderError={renderError}
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
  disconnect: {
    flex: 1,
  },
  urls: {
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  container: {
    flex: 1,
  },
});
