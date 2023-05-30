import React, {useCallback, useMemo} from 'react';

import {
  ActivityIndicator,
  Linking,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import WebView from 'react-native-webview';
import {
  ShouldStartLoadRequest,
  WebViewMessageEvent,
} from 'react-native-webview/lib/WebViewTypes';

import {Color} from '@app/colors';
import {DEBUG_VARS} from '@app/debug-vars';
import {createTheme} from '@app/helpers';
import {WebViewLogger} from '@app/helpers/webview-logger';

import {generateWebViewContent, patchPostMessageJsCode} from './hcaptcha-utils';

export interface HcaptchaProps {
  onMessage?: (event: any) => void;
  siteKey: string;
  size?: string;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  url?: string;
  languageCode?: string;
  showLoading?: boolean;
  loadingIndicatorColor?: string;
  backgroundColor?: string;
  theme?: string | object;
  rqdata?: string;
  sentry?: boolean;
  jsSrc?: string;
  endpoint?: string;
  reportapi?: string;
  assethost?: string;
  imghost?: string;
  host?: string;
  enableAutoOpenChallenge?: boolean;
}

export const Hcaptcha = (props: HcaptchaProps) => {
  const generateTheWebViewContent = useMemo(
    () => generateWebViewContent(props),
    [props],
  );

  // This shows ActivityIndicator till webview loads hCaptcha images
  const renderLoading = useCallback(
    () => (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color={props.loadingIndicatorColor} />
      </View>
    ),
    [props.loadingIndicatorColor],
  );

  const onShouldStartLoadWithRequest = useCallback(
    (event: ShouldStartLoadRequest) => {
      if (event.url.slice(0, 24) === 'https://www.hcaptcha.com') {
        Linking.openURL(event.url);
        return false;
      }
      return true;
    },
    [],
  );

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      if (DEBUG_VARS.enableCaptchaLogger) {
        const handled = WebViewLogger.handleEvent(event, 'HCapthca');
        if (handled) {
          return;
        }
      }
      props.onMessage?.(event);
    },
    [props],
  );

  return (
    <WebView
      scrollEnabled={false}
      originWhitelist={['*']}
      onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      mixedContentMode={'always'}
      onMessage={onMessage}
      javaScriptEnabled
      injectedJavaScript={patchPostMessageJsCode}
      automaticallyAdjustContentInsets
      containerStyle={props.containerStyle}
      style={[styles.webview, props.style]}
      source={{
        html: generateTheWebViewContent,
        baseUrl: `${props.url}`,
      }}
      renderLoading={renderLoading}
      startInLoadingState={props.showLoading}
    />
  );
};

const styles = createTheme({
  loadingOverlay: {
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  webview: {
    backgroundColor: Color.transparent,
    width: '100%',
  },
});
