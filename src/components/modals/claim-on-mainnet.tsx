import React, {useEffect} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {BottomPopupContainer} from '@app/components/bottom-popups';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {ModalType, Modals} from '@app/types';

export const ClaimOnMainNet = ({
  onClose,
  onChange,
  network,
}: Modals[ModalType.claimOnMainnet]) => {
  useEffect(() => {
    vibrate(HapticEffects.error);
  }, []);

  return (
    <BottomPopupContainer>
      {onClosePopup => (
        <View style={styles.modalView}>
          <Text t5 i18n={I18N.claimOnMainnetTitle} center />
          <Spacer height={8} />
          <Text t14 i18n={I18N.claimOnMainnetDescription} center />
          <Spacer height={28} />
          <Button
            i18n={I18N.claimOnMainnetChange}
            onPress={() => {
              onChange();
              onClosePopup(onClose);
            }}
            variant={ButtonVariant.contained}
            size={ButtonSize.middle}
            style={styles.button}
          />
          <Spacer height={16} />
          <Button
            i18n={I18N.claimOnMainnetStay}
            i18params={{network}}
            onPress={() => onClosePopup(onClose)}
            variant={ButtonVariant.third}
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
