import React, {useCallback} from 'react';

import {HCAPTCHA_SITE_KEY} from '@env';
import Hcaptcha from '@hcaptcha/react-native-hcaptcha/Hcaptcha';
import {StyleSheet} from 'react-native';
import {WebViewMessageEvent} from 'react-native-webview';

import {app} from '@app/contexts';
import {useTheme} from '@app/hooks';
import {AppTheme} from '@app/types';

import {PopupBottomContainerHandleCloseType} from './bottom-popups';
import {CaptchaModalProps} from './modals/capthca-modal';

export type CaptchaDataTypes = ('error' | 'cancel' | 'expired') & string;

export const Captcha = ({
  onCloseModal,
  onClose,
}: CaptchaModalProps & {onCloseModal: PopupBottomContainerHandleCloseType}) => {
  const appTheme = useTheme();
  const theme = appTheme === AppTheme.dark ? 'dark' : 'light';

  const onMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      const data = event.nativeEvent.data as CaptchaDataTypes;
      onCloseModal(() => {
        app.emit('captcha-data', data);
        onClose();
      });
    },
    [onClose, onCloseModal],
  );

  return (
    <>
      <Hcaptcha
        siteKey={HCAPTCHA_SITE_KEY}
        showLoading
        size={'compact'}
        onMessage={onMessage}
        theme={theme}
        style={styles.container}
        backgroundColor={'transparent'}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
