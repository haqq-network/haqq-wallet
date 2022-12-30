import React, {useEffect} from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {BottomPopupContainer} from '@app/components/bottom-popups';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  ErrorCreateAccountIcon,
  Spacer,
  Text,
} from '@app/components/ui';
import {hideModal} from '@app/helpers/modal';
import {useThematicStyles, useTheme} from '@app/hooks';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';

export const ErrorCreateAccount = () => {
  useEffect(() => {
    vibrate(HapticEffects.error);
  }, []);

  const styles = useThematicStyles(stylesObj);
  const {colors} = useTheme();

  return (
    <BottomPopupContainer>
      {onClose => (
        <View style={styles.modalView}>
          <Text t5 center i18n={I18N.errorCreateAccountPopupTitle} />
          <Spacer height={8} />
          <Text t14 center i18n={I18N.errorCreateAccountPopupDescription} />
          <Spacer height={40} />
          <ErrorCreateAccountIcon
            color={colors.graphicSecond4}
            width={116}
            height={116}
          />
          <Spacer height={40} />
          <Button
            i18n={I18N.errorCreateAccountPopupClose}
            onPress={() => onClose(hideModal)}
            variant={ButtonVariant.second}
            size={ButtonSize.middle}
            style={styles.button}
          />
        </View>
      )}
    </BottomPopupContainer>
  );
};

const stylesObj = StyleSheet.create({
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
