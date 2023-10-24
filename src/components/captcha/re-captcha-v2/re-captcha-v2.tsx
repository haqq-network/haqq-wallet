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
import {ModalType} from '@app/types';
import {openInAppBrowser} from '@app/utils';

import {
  generateWebViewContent,
  patchPostMessageJsCode,
} from './re-captcha-v2-utils';

export interface ReCaptchaV2Props {
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

export const ReCaptchaV2 = (props: ReCaptchaV2Props) => {
  const userAgent = useRef(getUserAgent()).current;
  const generateTheWebViewContent = useMemo(
    () => generateWebViewContent(props),
    [props],
  );

  const onShouldStartLoadWithRequest = useCallback(
    (event: ShouldStartLoadRequest) => {
      if (
        (props.url && event?.url?.startsWith(props.url)) ||
        event?.url?.startsWith('https://www.google.com/recaptcha')
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

  // This shows ActivityIndicator till webview loads ReCaptchaV2 images
  const renderLoading = useCallback(
    () => (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color={props.loadingIndicatorColor} />
      </View>
    ),
    [props.loadingIndicatorColor],
  );

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      if (DEBUG_VARS.enableCaptchaLogger) {
        const handled = WebViewLogger.handleEvent(event, 'ReCaptchaV2');
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
