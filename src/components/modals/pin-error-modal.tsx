import React, {useEffect} from 'react';

import {Image, View} from 'react-native';

import {Color} from '@app/colors';
import {BottomPopupContainer} from '@app/components/bottom-popups';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Spacer,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {ModalType, Modals} from '@app/types';

export const PinErrorModal = ({
  details,
  onClose,
}: Modals[ModalType.pinError]) => {
  useEffect(() => {
    vibrate(HapticEffects.error);
  }, []);

  return (
    <BottomPopupContainer>
      {onClosePopup => (
        <View style={page.modalView}>
          <Text
            variant={TextVariant.t5}
            position={TextPosition.center}
            i18n={I18N.pinErrorModalTitle}
          />
          <Spacer height={8} />
          <Text
            variant={TextVariant.t14}
            position={TextPosition.center}
            i18n={I18N.pinErrorModalDescription}
          />
          {details && (
            <>
              <Spacer height={4} />
              <Text
                variant={TextVariant.t15}
                position={TextPosition.center}
                color={Color.textRed1}>
                [{details}]
              </Text>
            </>
          )}
          <Spacer height={32} />

          <Image source={require('@assets/images/pin-error.png')} />

          <Spacer height={38} />

          <Button
            onPress={() => onClosePopup(onClose)}
            variant={ButtonVariant.second}
            size={ButtonSize.middle}
            style={page.button}
            i18n={I18N.pinErrorModalClose}
          />
        </View>
      )}
    </BottomPopupContainer>
  );
};

const page = createTheme({
  modalView: {
    backgroundColor: Color.bg1,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 40,
    padding: 24,
  },
  button: {
    width: '100%',
  },
});
