import React, {useEffect} from 'react';

import {View} from 'react-native';

import {Color, getColor} from '@app/colors';
import {BottomPopupContainer} from '@app/components/bottom-popups';
import {
  AccountAddedIcon,
  Button,
  ButtonSize,
  ButtonVariant,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {Modals} from '@app/types';

export const ErrorAccountAdded = ({onClose}: Modals['errorAccountAdded']) => {
  useEffect(() => {
    vibrate(HapticEffects.error);
  }, []);

  return (
    <BottomPopupContainer>
      {onClosePopup => (
        <View style={styles.modalView}>
          <Text t5 i18n={I18N.errorAccountAddedTitle} center />
          <Spacer height={42} />
          <AccountAddedIcon
            color={getColor(Color.graphicSecond4)}
            width={116}
            height={116}
          />
          <Spacer height={42} />
          <Button
            i18n={I18N.errorAccountAddedClose}
            onPress={() => onClosePopup(onClose)}
            variant={ButtonVariant.second}
            size={ButtonSize.middle}
            style={styles.button}
          />
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
