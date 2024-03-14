import React, {useCallback} from 'react';

import {
  HCAPTCHA_SITE_KEY,
  HCAPTCHA_URL,
  RECAPTCHA_V2_SITEKEY,
  RECAPTCHA_V2_URL,
  TURNSTILE_SITEKEY,
  TURNSTILE_URL,
} from '@env';
import {observer} from 'mobx-react';
import {StyleSheet, View} from 'react-native';
import {WebViewMessageEvent} from 'react-native-webview';

import {getWindowHeight, getWindowWidth} from '@app/helpers';
import {AppTheme, Color, Theme, createTheme, getColor} from '@app/theme';

import {Hcaptcha, Ocaptcha, ReCaptchaV2, SliderCaptcha, Turnstile} from './';
import {First} from '../ui';

export type CaptchaDataTypes =
  | ('error' | 'expired' | 'chalcancel' | 'chalexpired' | 'click-outside')
  | string;

export enum CaptchaType {
  hcaptcha = 'hcaptcha',
  slider = 'slider',
  ocaptcha = 'ocaptcha',
  turnstile = 'turnstile',
  recaptcha2 = 'recaptcha2',
}

export interface CaptchaProps {
  languageCode?: string;
  enableAutoOpenChallenge?: boolean;
  type?: CaptchaType;

  onData(token: CaptchaDataTypes): void;
}

export const Captcha = observer(
  ({
    languageCode = 'en',
    enableAutoOpenChallenge,
    type = CaptchaType.slider,
    onData,
  }: CaptchaProps) => {
    const theme = Theme.currentTheme === AppTheme.dark ? 'dark' : 'light';

    const onMessage = useCallback(
      (event: WebViewMessageEvent) => {
        const data = event.nativeEvent.data as CaptchaDataTypes;
        onData?.(data);
      },
      [onData],
    );

    const onPressOutside = useCallback(() => {
      onData?.('click-outside');
    }, [onData]);

    return (
      <View style={styles.container}>
        <View onTouchEnd={onPressOutside} style={styles.overlay} />
        <First>
          {type === CaptchaType.slider && <SliderCaptcha onData={onData} />}
          {type === CaptchaType.ocaptcha && <Ocaptcha onData={onData} />}
          {type === CaptchaType.hcaptcha && (
            <>
              <View style={styles.whiteBox} />
              <Hcaptcha
                siteKey={HCAPTCHA_SITE_KEY}
                url={HCAPTCHA_URL}
                showLoading
                size={'compact'}
                onMessage={onMessage}
                theme={theme}
                style={styles.hcaptcha}
                containerStyle={styles.hcaptchaContainer}
                backgroundColor={'transparent'}
                enableAutoOpenChallenge={enableAutoOpenChallenge}
                languageCode={languageCode}
              />
            </>
          )}
          {type === CaptchaType.turnstile && (
            <>
              <View style={styles.whiteBox2} />
              <Turnstile
                url={TURNSTILE_URL}
                siteKey={TURNSTILE_SITEKEY}
                showLoading
                onMessage={onMessage}
                theme={theme}
                style={styles.hcaptcha}
                containerStyle={styles.hcaptchaContainer}
                backgroundColor={'transparent'}
                languageCode={languageCode}
              />
            </>
          )}
          {type === CaptchaType.recaptcha2 && (
            <>
              <View style={styles.whiteBox3} />
              <ReCaptchaV2
                showLoading
                siteKey={RECAPTCHA_V2_SITEKEY}
                url={RECAPTCHA_V2_URL}
                theme={theme}
                onMessage={onMessage}
                style={styles.hcaptcha}
                containerStyle={styles.hcaptchaContainer}
                backgroundColor={'transparent'}
                languageCode={languageCode}
              />
            </>
          )}
        </First>
      </View>
    );
  },
);

const styles = createTheme({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    elevation: 1,
  },
  hcaptchaContainer: {
    zIndex: 3,
    elevation: 3,
  },
  hcaptcha: {
    alignItems: 'center',
    justifyContent: 'center',
    height: getWindowHeight,
    width: getWindowWidth,
  },
  whiteBox: {
    position: 'absolute',
    borderRadius: 15,
    width: () => getWindowWidth() * 0.45,
    height: () => getWindowHeight() * 0.185,
    backgroundColor: getColor(Color.bg2),
    transform: [{translateX: -2}, {translateY: 2}],
    zIndex: 2,
    elevation: 2,
  },
  whiteBox2: {
    position: 'absolute',
    borderRadius: 15,
    width: () => getWindowWidth() * 0.355,
    height: () => getWindowHeight() * 0.155,
    backgroundColor: getColor(Color.bg1),
    transform: [{translateY: 2}],
    zIndex: 2,
    elevation: 2,
  },
  whiteBox3: {
    position: 'absolute',
    borderRadius: 15,
    width: () => getWindowWidth() * 0.45,
    height: () => getWindowHeight() * 0.185,
    backgroundColor: getColor(Color.bg1),
    transform: [{translateX: -3}, {translateY: 6}],
    zIndex: 2,
    elevation: 2,
  },
});
