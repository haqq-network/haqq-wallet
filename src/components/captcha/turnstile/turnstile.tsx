import React, {useCallback, useMemo, useRef} from 'react';

import {ActivityIndicator, StyleProp, View, ViewStyle} from 'react-native';
import WebView from 'react-native-webview';
import {
  ShouldStartLoadRequest,
  WebViewMessageEvent,
} from 'react-native-webview/lib/WebViewTypes';

import {DEBUG_VARS} from '@app/debug-vars';
import {hideModal} from '@app/helpers';
import {WebViewLogger} from '@app/helpers/webview-logger';
import {getUserAgent} from '@app/services/version';
import {Color, createTheme} from '@app/theme';
import {ModalType} from '@app/types';
import {openInAppBrowser} from '@app/utils';

import {
  generateWebViewContent,
  patchPostMessageJsCode,
} from './turnstile-utils';

export interface TurnstileProps {
  onMessage?: (event: any) => void;
  siteKey: string;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  url?: string;
  languageCode?: string;
  backgroundColor?: string;
  showLoading?: boolean;
  loadingIndicatorColor?: string;
  theme?: 'dark' | 'light' | 'auto' | string;
}

export const Turnstile = (props: TurnstileProps) => {
  const userAgent = useRef(getUserAgent()).current;
  const generateTheWebViewContent = useMemo(
    () => generateWebViewContent(props),
    [props],
  );

  // This shows ActivityIndicator till webview loads Turnstile images
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
      if (
        (props.url && event?.url?.startsWith(props.url)) ||
        event?.url?.startsWith('https://challenges.cloudflare.com')
      ) {
        return true;
      }

      if (event.url !== 'about:blank') {
        hideModal(ModalType.captcha);
        openInAppBrowser(event.url);
      }
      return false;
    },
    [props.url],
  );

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      if (DEBUG_VARS.enableCaptchaLogger) {
        const handled = WebViewLogger.handleEvent(event, 'Turnstile');
        if (handled) {
          return;
        }
      }
      props.onMessage?.(event);
    },
    [props],
  );

  // Logger.log(generateTheWebViewContent);

  return (
    <WebView
      onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      userAgent={userAgent}
      scrollEnabled={false}
      originWhitelist={['*']}
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
