import React, {useEffect, useState} from 'react';

import {Dimensions, Keyboard, View} from 'react-native';

import {Color} from '@app/colors';
import {BottomPopupContainer} from '@app/components/bottom-popups';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Input,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {ModalType, Modals} from '@app/types';

export const CustomProviderEmail = ({
  onClose,
  onChange,
}: Modals[ModalType.customProviderEmail]) => {
  const [email, setEmail] = useState('');
  useEffect(() => {
    vibrate(HapticEffects.error);
  }, []);

  const [spacerHeight, setSpacerHeight] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', e => {
      setSpacerHeight(
        (e.startCoordinates?.screenY ?? Dimensions.get('window').height) -
          e.endCoordinates.screenY,
      );
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setSpacerHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <BottomPopupContainer>
      {onClosePopup => (
        <View style={styles.modalView}>
          <Text t5 i18n={I18N.customProviderEmail} center />
          <Spacer height={8} />
          <Input
            value={email}
            onChangeText={setEmail}
            testID={'custom_provider_email_input'}
          />
          <Spacer height={28} />
          <Button
            i18n={I18N.customProviderEmailSubmit}
            onPress={() => {
              onChange(email);
              onClosePopup(onClose);
            }}
            variant={ButtonVariant.contained}
            size={ButtonSize.middle}
            style={styles.button}
            testID={'custom_provider_email_submit'}
          />
          <Spacer height={16} />
          <Button
            i18n={I18N.customProviderEmailCancel}
            onPress={() => onClosePopup(onClose)}
            variant={ButtonVariant.third}
            size={ButtonSize.middle}
            style={styles.button}
            testID={'custom_provider_email_cancel'}
          />
          <Spacer height={spacerHeight} />
        </View>
      )}
    </BottomPopupContainer>
  );
};

const styles = createTheme({
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
