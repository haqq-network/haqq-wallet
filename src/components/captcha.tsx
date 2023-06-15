import React, {useCallback} from 'react';

import {HCAPTCHA_SITE_KEY} from '@env';
import {StyleSheet, View} from 'react-native';
import {WebViewMessageEvent} from 'react-native-webview';

import {Color, getColor} from '@app/colors';
import {useTheme} from '@app/hooks';
import {AppTheme} from '@app/types';
import {WINDOW_HEIGHT, WINDOW_WIDTH} from '@app/variables/common';

import {Hcaptcha} from './hcaptcha';
import {SliderCaptcha} from './slider-captcha/slider-captcha';
import {First} from './ui';

export type CaptchaDataTypes = (
  | 'error'
  | 'expired'
  | 'chalcancel'
  | 'chalexpired'
  | 'click-outside'
) &
  string;

export enum CaptchaType {
  hcaptcha,
  slider,
}

export interface CaptchaProps {
  languageCode?: string;
  enableAutoOpenChallenge?: boolean;
  type?: CaptchaType;

  onData(token: CaptchaDataTypes): void;
}

export const Captcha = ({
  languageCode = 'en',
  enableAutoOpenChallenge,
  type = CaptchaType.slider,
  onData,
}: CaptchaProps) => {
  const appTheme = useTheme();
  const theme = appTheme === AppTheme.dark ? 'dark' : 'light';

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
        {type === CaptchaType.hcaptcha && (
          <>
            <View style={styles.whiteBox} />
            <Hcaptcha
              siteKey={HCAPTCHA_SITE_KEY}
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
      </First>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    flex: 1,
    width: '100%',
    height: '100%',
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
    height: WINDOW_HEIGHT,
    width: WINDOW_WIDTH,
  },
  whiteBox: {
    position: 'absolute',
    borderRadius: 15,
    width: WINDOW_WIDTH * 0.45,
    height: WINDOW_HEIGHT * 0.185,
    backgroundColor: getColor(Color.bg1),
    transform: [{translateX: -2}, {translateY: 2}],
    zIndex: 2,
    elevation: 2,
  },
});
