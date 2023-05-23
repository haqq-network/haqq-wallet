import React, {useEffect} from 'react';

import {View} from 'react-native';

import {BottomPopupContainer} from '@app/components/bottom-popups';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {HapticEffects, vibrate} from '@app/services/haptic';

import {Captcha, CaptchaType} from '../captcha';

export type CaptchaModalProps = {
  onClose: () => void;
  variant: CaptchaType;
};

export const CaptchaModal = ({onClose, variant}: CaptchaModalProps) => {
  useEffect(() => {
    vibrate(HapticEffects.warning);
  }, []);

  return (
    <BottomPopupContainer closeOnPressOut>
      {onCloseModal => (
        <View style={page.modalView}>
          <Captcha
            type={variant}
            onData={data => {
              if (data === 'chalcancel') {
                return;
              }

              app.emit('captcha-data', data);

              onCloseModal(() => {
                onClose?.();
              });
            }}
          />
        </View>
      )}
    </BottomPopupContainer>
  );
};

const page = createTheme({
  modalView: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
});
