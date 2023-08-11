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
import {createTheme, openURL} from '@app/helpers';
import {I18N} from '@app/i18n';
import {VariablesBool} from '@app/models/variables-bool';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {Modals} from '@app/types';
import {TERMS_OF_CONDITIONS} from '@app/variables/common';

export const RaffleAgreement = ({onClose}: Modals['ledgerLocked']) => {
  useEffect(() => {
    vibrate(HapticEffects.error);
  }, []);

  const onAgree = useCallback(
    (onCloseModal: (arg0: (() => void) | undefined) => void) => {
      VariablesBool.set('raffleAgreement', true);
      onCloseModal(onClose);
    },
    [onClose],
  );

  const onDisagree = useCallback(
    (onCloseModal: (arg0: (() => void) | undefined) => void) => {
      VariablesBool.set('raffleAgreement', false);
      onCloseModal(onClose);
    },
    [onClose],
  );

  const onPressLink = useCallback(() => {
    openURL(TERMS_OF_CONDITIONS);
  }, []);

  return (
    <BottomPopupContainer>
      {onCloseModal => (
        <View style={page.modalView}>
          <Text t5 center i18n={I18N.raffleAgreementTitle} />
          <Spacer height={8} />
          <Text t14 center>
            <Text t14 i18n={I18N.raffleAgreementDescription} />
            <Text
              t14
              onPress={onPressLink}
              i18n={I18N.raffleAgreementDescriptionLink}
              color={Color.textGreen1}
            />
          </Text>
          <Spacer height={20} />
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
