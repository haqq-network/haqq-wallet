import React, {useCallback, useEffect} from 'react';

import {Alert, Image, View} from 'react-native';

import {Color} from '@app/colors';
import {BottomPopupContainer} from '@app/components/bottom-popups';
import {
  Button,
  ButtonVariant,
  Spacer,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {ModalType, Modals} from '@app/types';

export const RemoveSSS = ({onClose}: Modals[ModalType.removeSSS]) => {
  useEffect(() => {
    vibrate(HapticEffects.warning);
  }, []);

  const onPressDelete = useCallback(() => {
    //
  }, []);

  const showAlert = useCallback(
    (onClosePopup: (onEnd: (() => void) | undefined) => void) => {
      Alert.alert(
        getText(I18N.removeSSSAlertTitle),
        getText(I18N.removeSSSAlertDescription),
        [
          {
            text: getText(I18N.removeSSSPrimary),
            style: 'destructive',
            onPress: () => onPressDelete(),
          },
          {
            text: getText(I18N.cancel),
            style: 'cancel',
            onPress: () => onClosePopup(onClose),
          },
        ],
        {cancelable: false},
      );
    },
    [onClose],
  );

  return (
    <BottomPopupContainer>
      {onClosePopup => (
        <View style={styles.modalView}>
          <Text
            variant={TextVariant.t5}
            position={TextPosition.center}
            i18n={I18N.removeSSSTitle}
          />
          <Spacer height={8} />
          <Text variant={TextVariant.t14}>
            {getText(I18N.removeSSSDescription)}
            <Text
              variant={TextVariant.t14}
              i18n={I18N.removeSSSDescriptionImportant}
              color={Color.textRed1}
            />
          </Text>

          <Image
            source={require('@assets/images/remove-sss.png')}
            style={styles.img}
          />

          <View style={styles.buttonContainer}>
            <Button
              style={styles.button}
              variant={ButtonVariant.contained}
              i18n={I18N.removeSSSSecondary}
              onPress={() => onClosePopup(onClose)}
            />
            <Button
              style={styles.button}
              variant={ButtonVariant.text}
              textColor={Color.textRed1}
              i18n={I18N.removeSSSPrimary}
              onPress={() => showAlert(onClosePopup)}
            />
          </View>
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
    paddingTop: 36,
    paddingBottom: 8,
  },
  img: {
    height: 136,
    width: 263,
    alignSelf: 'center',
    marginVertical: 32,
    marginHorizontal: 16,
  },
  button: {
    marginBottom: 16,
  },
  buttonContainer: {
    width: '100%',
  },
});
