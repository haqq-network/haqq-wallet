import React, {useCallback, useEffect} from 'react';

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
import {Modals} from '@app/types';

export const RaffleAgreement = ({onClose}: Modals['ledgerLocked']) => {
  useEffect(() => {
    vibrate(HapticEffects.error);
  }, []);

  const onAgree = useCallback(
    (onCloseModal: (arg0: (() => void) | undefined) => void) => {
      onCloseModal(onClose);
    },
    [onClose],
  );

  const onDisagree = useCallback(
    (onCloseModal: (arg0: (() => void) | undefined) => void) => {
      onCloseModal(onClose);
    },
    [onClose],
  );

  return (
    <BottomPopupContainer>
      {onCloseModal => (
        <View style={page.modalView}>
          <Text t5 center i18n={I18N.raffleAgreementTitle} />
          <Spacer height={8} />
          <Text t14 center i18n={I18N.raffleAgreementDescription} />
          <Button
            i18n={I18N.raffleAgreementAgree}
            onPress={() => onAgree(onCloseModal)}
            variant={ButtonVariant.contained}
            size={ButtonSize.middle}
          />
          <Spacer height={16} />
          <Button
            i18n={I18N.raffleAgreementClose}
            onPress={() => onDisagree(onCloseModal)}
            variant={ButtonVariant.third}
            size={ButtonSize.middle}
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
    marginHorizontal: 16,
    marginBottom: 40,
    padding: 24,
  },
});
