import React, {useCallback} from 'react';

import {HCAPTCHA_SITE_KEY} from '@env';
import {StyleSheet, View} from 'react-native';
import {WebViewMessageEvent} from 'react-native-webview';

import {Color, getColor} from '@app/colors';
import {Ocaptcha} from '@app/components/ocaptcha/ocaptcha';
import {createTheme, getWindowHeight, getWindowWidth} from '@app/helpers';
import {useTheme} from '@app/hooks';
import {AppTheme} from '@app/types';

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
  ocaptcha,
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
        {type === CaptchaType.ocaptcha && <Ocaptcha onData={onData} />}
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
    backgroundColor: getColor(Color.bg1),
    transform: [{translateX: -2}, {translateY: 2}],
    zIndex: 2,
    elevation: 2,
  },
});
