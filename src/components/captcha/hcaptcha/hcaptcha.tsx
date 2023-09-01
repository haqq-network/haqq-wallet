import React, {useCallback, useMemo, useRef} from 'react';

import {ActivityIndicator, StyleProp, View, ViewStyle} from 'react-native';
import WebView from 'react-native-webview';
import {
  ShouldStartLoadRequest,
  WebViewMessageEvent,
} from 'react-native-webview/lib/WebViewTypes';

import {Color} from '@app/colors';
import {DEBUG_VARS} from '@app/debug-vars';
import {createTheme, hideModal} from '@app/helpers';
import {WebViewLogger} from '@app/helpers/webview-logger';
import {getUserAgent} from '@app/services/version';
import {openInAppBrowser} from '@app/utils';

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
  const userAgent = useRef(getUserAgent()).current;
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
      if (
        (props.url && event?.url?.startsWith(props.url)) ||
        event?.url?.startsWith('https://newassets.hcaptcha.com/captcha')
      ) {
        return true;
      }

      if (event.url !== 'about:blank') {
        hideModal('captcha');
        openInAppBrowser(event.url);
      }
      return false;
    },
    [props.url],
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
