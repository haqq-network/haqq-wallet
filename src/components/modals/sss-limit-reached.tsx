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

export const SSSLimitReached = ({
  onClose,
}: Modals[ModalType.locationUnauthorized]) => {
  useEffect(() => {
    vibrate(HapticEffects.error);
  }, []);

  return (
    <BottomPopupContainer>
      {onCloseModal => (
        <View style={page.modalView}>
          <Text
            variant={TextVariant.t5}
            position={TextPosition.center}
            i18n={I18N.sssLimitReachedTitle}
          />
          <Spacer height={8} />
          <Text
            variant={TextVariant.t14}
            position={TextPosition.center}
            i18n={I18N.sssLimitReachedDescription}
          />
          <Spacer height={20} />
          <Image
            style={page.image}
            source={require('@assets/images/sss-limit-reached.png')}
            height={295}
            width={124}
          />
          <Spacer height={20} />
          <Button
            i18n={I18N.sssLimitReachedButton}
            onPress={() => onCloseModal(onClose)}
            variant={ButtonVariant.second}
            size={ButtonSize.large}
          />
        </View>
      )}
    </BottomPopupContainer>
  );
};

const page = createTheme({
  image: {alignSelf: 'center'},
  modalView: {
    backgroundColor: Color.bg1,
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: 40,
    padding: 24,
  },
});
