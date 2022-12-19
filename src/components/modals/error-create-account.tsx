import React, {useEffect} from 'react';

import {View} from 'react-native';

import {Color, getColor} from '@app/colors';
import {BottomPopupContainer} from '@app/components/bottom-popups';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  ErrorCreateAccountIcon,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {hideModal} from '@app/helpers/modal';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';

export const ErrorCreateAccount = () => {
  useEffect(() => {
    vibrate(HapticEffects.error);
  }, []);

  return (
    <BottomPopupContainer>
      {onClose => (
        <View style={page.modalView}>
          <Text t5 center i18n={I18N.errorCreateAccountPopupTitle}>
            Failed to create an account
          </Text>
          <Spacer height={8} />
          <Text t14 center i18n={I18N.errorCreateAccountPopupDescription}>
            Please try again later
          </Text>
          <Spacer height={40} />
          <ErrorCreateAccountIcon
            color={getColor(Color.graphicSecond4)}
            width={116}
            height={116}
          />
          <Spacer height={40} />
          <Button
            i18n={I18N.errorCreateAccountPopupClose}
            onPress={() => onClose(hideModal)}
            variant={ButtonVariant.second}
            size={ButtonSize.middle}
            style={page.button}
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
