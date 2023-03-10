import React, {useEffect} from 'react';

import {View} from 'react-native';

import {BottomPopupContainer} from '@app/components/bottom-popups';
import {createTheme} from '@app/helpers';
import {HapticEffects, vibrate} from '@app/services/haptic';

import {Captcha} from '../captcha';

export type CaptchaModalProps = {
  onClose: () => void;
};

export const CaptchaModal = ({onClose}: CaptchaModalProps) => {
  useEffect(() => {
    vibrate(HapticEffects.warning);
  }, []);

  return (
    <BottomPopupContainer>
      {onCloseModal => (
        <View style={page.modalView}>
          <Captcha onCloseModal={onCloseModal} onClose={onClose} />
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
