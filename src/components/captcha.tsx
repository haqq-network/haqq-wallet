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

  return (
    <View style={styles.container}>
      {type === CaptchaType.hcaptcha && (
        <>
          <View style={styles.whiteBox} />
          <Hcaptcha
            siteKey={HCAPTCHA_SITE_KEY}
            showLoading
            size={'compact'}
            onMessage={onMessage}
            theme={theme}
            style={styles.captcha}
            backgroundColor={'transparent'}
            enableAutoOpenChallenge={enableAutoOpenChallenge}
            languageCode={languageCode}
          />
        </>
      )}
      {type === CaptchaType.slider && <SliderCaptcha onData={onData} />}
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
  captcha: {
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
  },
});
