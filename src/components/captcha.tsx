import React, {useCallback} from 'react';

import {HCAPTCHA_SITE_KEY} from '@env';
import Hcaptcha from '@hcaptcha/react-native-hcaptcha/Hcaptcha';
import {Dimensions, StyleSheet, View} from 'react-native';
import {WebViewMessageEvent} from 'react-native-webview';

import {Color, getColor} from '@app/colors';
import {useTheme} from '@app/hooks';
import {AppTheme} from '@app/types';

export type CaptchaDataTypes = (
  | 'error'
  | 'expired'
  | 'chalcancel'
  | 'chalexpired'
  | 'click-outside'
) &
  string;

export interface CaptchaProps {
  languageCode?: string;
  enableAutoOpenChallenge?: boolean;
  onData(token: CaptchaDataTypes): void;
}

export const Captcha = ({
  languageCode = 'en',
  enableAutoOpenChallenge,
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
    </View>
  );
};

const screen = Dimensions.get('screen');

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
    height: screen.height,
    width: screen.width,
  },
  whiteBox: {
    position: 'absolute',
    borderRadius: 15,
    width: screen.width * 0.45,
    height: screen.height * 0.185,
    backgroundColor: getColor(Color.bg1),
    transform: [{translateX: -2}, {translateY: 2}],
  },
});
