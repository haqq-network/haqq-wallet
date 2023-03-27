import React, {useCallback} from 'react';

import {StyleSheet} from 'react-native';
import {View} from 'react-native';
import WebView, {WebViewMessageEvent} from 'react-native-webview';

import {InpageBridgeWeb3} from './InpageBridgeWeb3';

export interface Web3BrowserProps {
  initialUrl: string;
}

export const Web3Browser = ({initialUrl}: Web3BrowserProps) => {
  const onMessage = useCallback((event: WebViewMessageEvent) => {
    console.log('⚪️ onMessage', event.nativeEvent);
  }, []);

  return (
    <View style={styles.container}>
      <WebView
        injectedJavaScriptBeforeContentLoaded={InpageBridgeWeb3}
        onMessage={onMessage}
        source={{uri: initialUrl}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    flex: 1,
  },
});
